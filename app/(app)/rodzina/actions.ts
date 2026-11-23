"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { supabaseStorage, FAMILY_AVATARS_BUCKET } from "@/lib/supabase/storage";
import { sendFamilyInvitationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";

type ActionResult = {
  success: boolean;
  error?: string;
};

type MemberInput = {
  name: string;
  email?: string;
  roleDescription?: string;
  color?: string;
};

async function getFamilyContext() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      familyId: true,
      family: {
        select: {
          name: true,
        },
      },
      familyMember: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  });

  if (!user?.familyId || !user.familyMember || !user.family) {
    return null;
  }

  return {
    userId: user.id,
    familyId: user.familyId,
    memberId: user.familyMember.id,
    role: user.familyMember.role,
    inviterName: user.name,
    familyName: user.family?.name || "...",
  };
}

function validateMemberInput(input: MemberInput) {
  const name = input.name.trim();
  const email = input.email?.trim().toLowerCase() || null;
  const roleDescription = input.roleDescription?.trim() || null;

  if (name.length < 2 || name.length > 60) {
    return { error: "Imię musi mieć od 2 do 60 znaków." };
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Podaj prawidłowy adres e-mail." };
  }

  if (roleDescription && roleDescription.length > 150) {
    return { error: "Opis może mieć maksymalnie 150 znaków." };
  }

  const color = input.color?.trim() || "#E4EBD5";

  if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
    return { error: "Nieprawidłowy kolor profilu." };
  }

  return {
    data: {
      name,
      email,
      roleDescription,
      color,
    },
  };
}
function readMemberFormData(formData: FormData) {
  const input: MemberInput = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    roleDescription: String(formData.get("roleDescription") ?? ""),
    color: String(formData.get("color") ?? "#E4EBD5"),
  };

  const avatarValue = formData.get("avatar");

  const avatar =
    avatarValue instanceof File && avatarValue.size > 0 ? avatarValue : null;

  const removeAvatar = formData.get("removeAvatar") === "true";

  return {
    input,
    avatar,
    removeAvatar,
  };
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

async function uploadFamilyAvatar(
  file: File,
  familyId: string,
  memberId: string,
) {
  if (file.size === 0 || file.size > MAX_AVATAR_SIZE) {
    throw new Error("Zdjęcie musi mieć maksymalnie 5 MB.");
  }

  const extension =
    ALLOWED_AVATAR_TYPES[file.type as keyof typeof ALLOWED_AVATAR_TYPES];

  if (!extension) {
    throw new Error("Dozwolone formaty: JPG, PNG i WebP.");
  }

  const path = `${familyId}/${memberId}/${randomUUID()}.${extension}`;

  const { error } = await supabaseStorage.storage
    .from(FAMILY_AVATARS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Supabase avatar upload error:", error);
    throw new Error("Nie udało się przesłać zdjęcia.");
  }

  const { data } = supabaseStorage.storage
    .from(FAMILY_AVATARS_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

async function deleteFamilyAvatar(
  imageUrl: string | null,
  familyId: string,
  memberId: string,
) {
  if (!imageUrl || !familyId || !memberId) return;

  try {
    const url = new URL(imageUrl);
    const supabaseUrl = process.env.SUPABASE_URL;

    if (!supabaseUrl) return;

    // Akceptujemy wyłącznie adres z naszego projektu Supabase.
    if (url.origin !== new URL(supabaseUrl).origin) return;

    const marker = `/storage/v1/object/public/${FAMILY_AVATARS_BUCKET}/`;

    const markerIndex = url.pathname.indexOf(marker);

    if (markerIndex === -1) return;

    const path = decodeURIComponent(
      url.pathname.slice(markerIndex + marker.length),
    );

    // Plik musi należeć do konkretnej rodziny i profilu.
    const expectedPrefix = `${familyId}/${memberId}/`;

    if (!path.startsWith(expectedPrefix)) return;

    const { error } = await supabaseStorage.storage
      .from(FAMILY_AVATARS_BUCKET)
      .remove([path]);

    if (error) {
      console.error("Supabase avatar delete error:", error);
    }
  } catch (error) {
    console.error("Avatar cleanup error:", error);
  }
}

// Dodawanie dziecka
export async function createChild(formData: FormData): Promise<ActionResult> {
  let createdMemberId: string | null = null;
  let uploadedImageUrl: string | null = null;

  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    if (context.role !== "HEAD") {
      return {
        success: false,
        error: "Nie masz uprawnień do dodawania członków.",
      };
    }

    const { input, avatar } = readMemberFormData(formData);
    const validation = validateMemberInput(input);

    if (!validation.data) {
      return { success: false, error: validation.error };
    }

    const { name, email, roleDescription, color } = validation.data;

    if (email) {
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId: context.familyId,
          email: { equals: email, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (existingMember) {
        return {
          success: false,
          error: "Członek rodziny z takim adresem e-mail już istnieje.",
        };
      }

      const existingInvitation = await prisma.familyInvitation.findFirst({
        where: {
          familyId: context.familyId,
          email: { equals: email, mode: "insensitive" },
          status: "PENDING",
          expiresAt: { gt: new Date() },
        },
        select: { id: true },
      });

      if (existingInvitation) {
        return {
          success: false,
          error: "Dla tego adresu istnieje już oczekujące zaproszenie.",
        };
      }
    }

    const member = await prisma.familyMember.create({
      data: {
        name,
        email,
        role: "CHILD",
        roleDescription,
        color,
        familyId: context.familyId,
      },
      select: { id: true },
    });

    createdMemberId = member.id;

    if (avatar) {
      uploadedImageUrl = await uploadFamilyAvatar(
        avatar,
        context.familyId,
        member.id,
      );

      await prisma.familyMember.update({
        where: { id: member.id },
        data: { imageUrl: uploadedImageUrl },
      });
    }

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("createChild error:", error);

    // Sprzątamy plik i profil, jeśli tworzenie nie zakończyło się poprawnie.
    if (createdMemberId) {
      if (uploadedImageUrl) {
        await deleteFamilyAvatar(
          uploadedImageUrl,
          // Profil został utworzony w kontekście tej rodziny.
          // Pobieramy jego familyId z rekordu, jeśli jest dostępny.
          (
            await prisma.familyMember.findUnique({
              where: { id: createdMemberId },
              select: { familyId: true },
            })
          )?.familyId ?? "",
          createdMemberId,
        );
      }

      await prisma.familyMember.deleteMany({
        where: { id: createdMemberId },
      });
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Nie udało się dodać dziecka.",
    };
  }
}

// Edycja profilu
export async function updateFamilyMember(
  memberId: string,
  formData: FormData,
): Promise<ActionResult> {
  let uploadedImageUrl: string | null = null;

  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: context.familyId,
      },
      select: {
        id: true,
        role: true,
        userId: true,
        imageUrl: true,
      },
    });

    if (!member) {
      return { success: false, error: "Nie znaleziono członka rodziny." };
    }

    const isHead = context.role === "HEAD";
    const isOwnProfile = member.id === context.memberId;

    if (!isHead && !isOwnProfile) {
      return {
        success: false,
        error: "Nie masz uprawnień do edycji tego profilu.",
      };
    }

    if (member.role === "HEAD" && !isHead) {
      return {
        success: false,
        error: "Nie możesz edytować profilu głowy rodziny.",
      };
    }

    const { input, avatar, removeAvatar } = readMemberFormData(formData);
    const validation = validateMemberInput(input);

    if (!validation.data) {
      return { success: false, error: validation.error };
    }

    const { name, email, roleDescription, color } = validation.data;

    if (email) {
      const existingMember = await prisma.familyMember.findFirst({
        where: {
          familyId: context.familyId,
          id: { not: memberId },
          email: { equals: email, mode: "insensitive" },
        },
        select: { id: true },
      });

      if (existingMember) {
        return {
          success: false,
          error: "Inny członek rodziny używa już tego adresu e-mail.",
        };
      }
    }

    if (avatar) {
      uploadedImageUrl = await uploadFamilyAvatar(
        avatar,
        context.familyId,
        member.id,
      );
    }

    const nextImageUrl = avatar
      ? uploadedImageUrl
      : removeAvatar
        ? null
        : member.imageUrl;

    await prisma.familyMember.update({
      where: { id: memberId },
      data: {
        name,
        email,
        roleDescription,
        color,
        imageUrl: nextImageUrl,
      },
    });

    // Stare zdjęcie usuwamy dopiero po udanym zapisie nowego URL.
    if (member.imageUrl && member.imageUrl !== nextImageUrl) {
      await deleteFamilyAvatar(member.imageUrl, context.familyId, member.id);
    }

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("updateFamilyMember error:", error);

    // Jeśli nowy plik został wysłany, ale zapis profilu się nie udał,
    // usuwamy tylko ten nowy plik.
    if (uploadedImageUrl) {
      await deleteFamilyAvatar(
        uploadedImageUrl,
        (await getFamilyContext())?.familyId ?? "",
        memberId,
      );
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Nie udało się zaktualizować profilu.",
    };
  }
}

export async function deleteFamilyMember(memberId: string) {
  const context = await getFamilyContext();

  if (!context || context.role !== "HEAD") {
    return {
      success: false,
      message: "Nie masz uprawnień do usunięcia członka rodziny.",
    };
  }

  if (!memberId) {
    return {
      success: false,
      message: "Nieprawidłowy identyfikator członka rodziny.",
    };
  }

  try {
    const member = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: context.familyId,
      },
      select: {
        id: true,
        role: true,
        userId: true,
      },
    });

    if (!member) {
      return {
        success: false,
        message: "Nie znaleziono członka rodziny.",
      };
    }

    if (member.role === "HEAD") {
      return {
        success: false,
        message: "Nie można usunąć głowy rodziny.",
      };
    }

    if (member.id === context.memberId) {
      return {
        success: false,
        message: "Nie możesz usunąć własnego profilu.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (member.userId) {
        await tx.user.delete({
          where: {
            id: member.userId,
          },
        });
      } else {
        await tx.familyMember.delete({
          where: {
            id: member.id,
          },
        });
      }
    });

    return {
      success: true,
      message: member.userId
        ? "Konto i profil członka rodziny zostały usunięte."
        : "Profil członka rodziny został usunięty.",
    };
  } catch (error) {
    console.error("Błąd podczas usuwania członka rodziny:", error);

    return {
      success: false,
      message: "Nie udało się usunąć członka rodziny.",
    };
  }
}

type InvitationResult = {
  success: boolean;
  error?: string;
};

export async function createFamilyInvitation(
  emailInput: string,
): Promise<InvitationResult> {
  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    if (context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może zapraszać nowych członków.",
      };
    }

    const email = emailInput.trim().toLowerCase();

    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        success: false,
        error: "Podaj prawidłowy adres e-mail.",
      };
    }

    // Sprawdzenie istniejącego profilu w tej rodzinie.
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        familyId: context.familyId,
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingMember) {
      return {
        success: false,
        error: "Ta osoba jest już członkiem rodziny.",
      };
    }

    // Sprawdzenie, czy konto nie należy już do innej rodziny.
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: {
        familyId: true,
      },
    });

    if (existingUser?.familyId) {
      return {
        success: false,
        error:
          existingUser.familyId === context.familyId
            ? "To konto należy już do tej rodziny."
            : "To konto jest już przypisane do innej rodziny.",
      };
    }

    const now = new Date();

    // Oznaczamy nieaktualne zaproszenia jako wygasłe.
    await prisma.familyInvitation.updateMany({
      where: {
        familyId: context.familyId,
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: "PENDING",
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Sprawdzamy, czy istnieje aktywne zaproszenie.
    const existingInvitation = await prisma.familyInvitation.findFirst({
      where: {
        familyId: context.familyId,
        email: {
          equals: email,
          mode: "insensitive",
        },
        status: "PENDING",
        expiresAt: {
          gt: now,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingInvitation) {
      return {
        success: false,
        error: "Dla tego adresu istnieje już aktywne zaproszenie.",
      };
    }

    // Generujemy kryptograficznie bezpieczny token.
    const token = randomBytes(32).toString("hex");

    // W bazie przechowujemy wyłącznie hash tokenu.
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const baseUrl = process.env.NEXTAUTH_URL;

    if (!baseUrl) {
      throw new Error("Brak konfiguracji NEXTAUTH_URL.");
    }

    const invitationUrl = new URL(`/zaproszenie/${token}`, baseUrl).toString();

    const invitation = await prisma.familyInvitation.create({
      data: {
        email,
        tokenHash,
        familyId: context.familyId,
        invitedByUserId: context.userId,
        expiresAt,
      },
      select: {
        id: true,
      },
    });

    try {
      await sendFamilyInvitationEmail({
        email,
        familyName: context.familyName,
        inviterName: context.inviterName,
        invitationUrl,
        expiresAt,
      });
    } catch (emailError) {
      console.error("Family invitation email error:", emailError);

      // Nie pozostawiamy aktywnego zaproszenia, którego nie udało się wysłać.
      await prisma.familyInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "REVOKED",
          revokedAt: new Date(),
        },
      });

      return {
        success: false,
        error: "Nie udało się wysłać wiadomości e-mail. Spróbuj ponownie.",
      };
    }

    revalidatePath("/rodzina");

    return {
      success: true,
    };
  } catch (error) {
    console.error("createFamilyInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się utworzyć zaproszenia.",
    };
  }
}

export async function revokeFamilyInvitation(
  invitationId: string,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context) {
      return {
        success: false,
        error: "Nie znaleziono członkostwa w rodzinie.",
      };
    }

    if (context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może anulować zaproszenia.",
      };
    }

    const invitation = await prisma.familyInvitation.findFirst({
      where: {
        id: invitationId,
        familyId: context.familyId,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!invitation) {
      return {
        success: false,
        error: "Zaproszenie nie istnieje lub nie jest już aktywne.",
      };
    }

    await prisma.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "REVOKED",
        revokedAt: new Date(),
      },
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("revokeFamilyInvitation error:", error);

    return {
      success: false,
      error: "Nie udało się anulować zaproszenia.",
    };
  }
}

export async function transferFamilyHead(newHeadMemberId: string) {
  const context = await getFamilyContext();

  if (!context || context.role !== "HEAD") {
    return {
      success: false,
      message: "Tylko głowa rodziny może przekazać tę rolę.",
    };
  }

  if (!newHeadMemberId || newHeadMemberId === context.memberId) {
    return {
      success: false,
      message: "Wybierz innego dorosłego członka rodziny.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const newHead = await tx.familyMember.findFirst({
        where: {
          id: newHeadMemberId,
          familyId: context.familyId,
          role: "ADULT",
        },
        select: {
          id: true,
        },
      });

      if (!newHead) {
        throw new Error("INVALID_TARGET");
      }

      // Najpierw zdejmujemy rolę HEAD z obecnego administratora.
      const currentHead = await tx.familyMember.updateMany({
        where: {
          id: context.memberId,
          familyId: context.familyId,
          role: "HEAD",
        },
        data: {
          role: "ADULT",
        },
      });

      if (currentHead.count !== 1) {
        throw new Error("CURRENT_HEAD_NOT_FOUND");
      }

      // Następnie przekazujemy rolę wybranemu dorosłemu.
      const updatedNewHead = await tx.familyMember.updateMany({
        where: {
          id: newHead.id,
          familyId: context.familyId,
          role: "ADULT",
        },
        data: {
          role: "HEAD",
        },
      });

      if (updatedNewHead.count !== 1) {
        throw new Error("TARGET_UPDATE_FAILED");
      }
    });

    return {
      success: true,
      message: "Rola głowy rodziny została przekazana.",
    };
  } catch (error) {
    console.error("Błąd podczas przekazywania roli HEAD:", error);

    return {
      success: false,
      message:
        error instanceof Error && error.message === "INVALID_TARGET"
          ? "Wybrany członek rodziny nie jest dorosłym lub nie należy do tej rodziny."
          : "Nie udało się przekazać roli głowy rodziny.",
    };
  }
}

export async function activateChildAccount(
  memberId: string,
  password: string,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context || context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może aktywować konto dziecka.",
      };
    }

    if (!memberId || typeof password !== "string") {
      return {
        success: false,
        error: "Nieprawidłowe dane.",
      };
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
      return {
        success: false,
        error: "Hasło musi mieć minimum 8 znaków i maksymalnie 72 bajty.",
      };
    }

    const child = await prisma.familyMember.findFirst({
      where: {
        id: memberId,
        familyId: context.familyId,
        role: "CHILD",
      },
      select: {
        id: true,
        name: true,
        email: true,
        familyId: true,
        userId: true,
      },
    });

    if (!child) {
      return {
        success: false,
        error: "Nie znaleziono profilu dziecka.",
      };
    }

    if (child.userId) {
      return {
        success: false,
        error: "To dziecko ma już aktywne konto.",
      };
    }

    if (!child.email) {
      return {
        success: false,
        error: "Najpierw dodaj adres e-mail do profilu dziecka.",
      };
    }

    const email = child.email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        error: "Konto z tym adresem e-mail już istnieje.",
      };
    }

    const existingMember = await prisma.familyMember.findFirst({
      where: {
        id: { not: child.id },
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
      select: { id: true },
    });

    if (existingMember) {
      return {
        success: false,
        error: "Ten adres e-mail jest przypisany do innego profilu.",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name: child.name,
          password: hashedPassword,
          role: "USER",
          familyId: child.familyId,
        },
      });

      const updatedMember = await tx.familyMember.updateMany({
        where: {
          id: child.id,
          familyId: context.familyId,
          role: "CHILD",
          userId: null,
        },
        data: {
          userId: user.id,
          email,
        },
      });

      if (updatedMember.count !== 1) {
        throw new Error("CHILD_ACTIVATION_FAILED");
      }
    });

    revalidatePath("/rodzina");

    return { success: true };
  } catch (error) {
    console.error("activateChildAccount error:", error);

    return {
      success: false,
      error:
        error instanceof Error && error.message === "CHILD_ACTIVATION_FAILED"
          ? "Profil dziecka został już aktywowany."
          : "Nie udało się aktywować konta dziecka.",
    };
  }
}

export async function promoteChildToAdult(
  memberId: string,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context || context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może zmieniać role.",
      };
    }

    if (!memberId) {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator członka rodziny.",
      };
    }

    const result = await prisma.familyMember.updateMany({
      where: {
        id: memberId,
        familyId: context.familyId,
        role: "CHILD",
        userId: { not: null },
      },
      data: {
        role: "ADULT",
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error:
          "Nie znaleziono aktywnego profilu dziecka lub jego rola została już zmieniona.",
      };
    }

    revalidatePath("/rodzina");
    revalidatePath("/harmonogram");
    revalidatePath("/zadania");

    return { success: true };
  } catch (error) {
    console.error("promoteChildToAdult error:", error);

    return {
      success: false,
      error: "Nie udało się zmienić roli członka rodziny.",
    };
  }
}
export async function deactivateChildAccount(
  memberId: string,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context || context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może dezaktywować konta.",
      };
    }

    if (!memberId) {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator członka rodziny.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const child = await tx.familyMember.findFirst({
        where: {
          id: memberId,
          familyId: context.familyId,
          role: "CHILD",
          userId: { not: null },
        },
        select: {
          id: true,
          userId: true,
        },
      });

      if (!child?.userId) {
        throw new Error("CHILD_ACCOUNT_NOT_FOUND");
      }

      // Najpierw odłączamy konto od profilu dziecka.
      const detachedMember = await tx.familyMember.updateMany({
        where: {
          id: child.id,
          familyId: context.familyId,
          role: "CHILD",
          userId: child.userId,
        },
        data: {
          userId: null,
        },
      });

      if (detachedMember.count !== 1) {
        throw new Error("CHILD_DEACTIVATION_FAILED");
      }

      // Następnie usuwamy konto logowania.
      const deletedUser = await tx.user.deleteMany({
        where: {
          id: child.userId,
          familyId: context.familyId,
        },
      });

      if (deletedUser.count !== 1) {
        throw new Error("CHILD_DEACTIVATION_FAILED");
      }
    });

    revalidatePath("/rodzina");
    revalidatePath("/harmonogram");
    revalidatePath("/zadania");

    return { success: true };
  } catch (error) {
    console.error("deactivateChildAccount error:", error);

    return {
      success: false,
      error:
        error instanceof Error && error.message === "CHILD_ACCOUNT_NOT_FOUND"
          ? "Nie znaleziono aktywnego konta dziecka."
          : "Nie udało się dezaktywować konta dziecka.",
    };
  }
}
export async function demoteAdultToChild(
  memberId: string,
): Promise<ActionResult> {
  try {
    const context = await getFamilyContext();

    if (!context || context.role !== "HEAD") {
      return {
        success: false,
        error: "Tylko głowa rodziny może zmieniać role.",
      };
    }

    if (!memberId) {
      return {
        success: false,
        error: "Nieprawidłowy identyfikator członka rodziny.",
      };
    }

    const result = await prisma.familyMember.updateMany({
      where: {
        id: memberId,
        familyId: context.familyId,
        role: "ADULT",
        userId: { not: null },
      },
      data: {
        role: "CHILD",
      },
    });

    if (result.count !== 1) {
      return {
        success: false,
        error:
          "Nie znaleziono aktywnego profilu dorosłego lub jego rola została już zmieniona.",
      };
    }

    revalidatePath("/rodzina");
    revalidatePath("/harmonogram");
    revalidatePath("/zadania");

    return { success: true };
  } catch (error) {
    console.error("demoteAdultToChild error:", error);

    return {
      success: false,
      error: "Nie udało się zmienić roli członka rodziny.",
    };
  }
}
