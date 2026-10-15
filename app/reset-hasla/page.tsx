import ForgotPasswordForm from "@/components/account/ForgotPasswordForm";
import ResetPasswordForm from "@/components/account/ResetPasswordForm";
import Image from "next/image";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Image
          src="/logo.png"
          alt="logo"
          width={150}
          height={150}
          className="object-fit mx-auto mr-[30%] xl:mr-[33%]"
        />

        <div className="">
          {token ? <ResetPasswordForm token={token} /> : <ForgotPasswordForm />}
        </div>
      </div>
    </main>
  );
}
