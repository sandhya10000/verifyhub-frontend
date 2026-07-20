import useAuth from "../context/useAuth";

function Navbar() {
  const { logout, user } = useAuth();

  return (
    <>
      <h3>{user?.name}</h3>

      <button onClick={logout}>Logout</button>
    </>
  );
}

export default Navbar;
