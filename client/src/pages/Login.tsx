import AuthForm from "@/components/auth/AuthForm";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Headerunloged";

const Login = () => {
  const { user } = useAuth();
  return (
    <>
      <Header user={user} />

      <AuthForm />
    </>
  );
};

export default Login;
