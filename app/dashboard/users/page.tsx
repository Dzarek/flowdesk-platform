import { userService } from "@/src/services/user.service";

export default async function UsersPage() {
  const users = await userService.getUsers();

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Users</h1>

      <table className="w-full border">
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
