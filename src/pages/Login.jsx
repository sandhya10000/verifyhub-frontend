import useAuth from "../context/useAuth";

function Login() {
  const { login } = useAuth();

  const handleLogin = async () => {
    // API call

    const token = "abc123";

    const user = {
      name: "Sandhya",
      role: "admin",
      email: "sandhya@gmail.com",
    };

    login(token, user);
  };

  return <button onClick={handleLogin}>Login</button>;
}

export default Login;
