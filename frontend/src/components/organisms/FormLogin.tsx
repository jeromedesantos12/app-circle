import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { usersKeys, loginUser } from "../../queries/user";
import { Input, Button, Alert } from "../atoms";
import { Form } from "../molecules";
import { loginSchema, type LoginFormData } from "../../schema/login";

export function FormLogin() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
    },
  });
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: loginUser,
    onSuccess: () => {
      navigate("/");
    },
  });

  function onSubmit(data: LoginFormData) {
    mutate(data);
  }

  return (
    <Form title="Login to Circle" onSubmit={handleSubmit(onSubmit)}>
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response
            ? error.response.data.message
            : error.message}
        </Alert>
      )}
      <Input type="text" id="emailOrUsername" {...register("emailOrUsername")}>
        Email/Username
      </Input>
      {errors.emailOrUsername && (
        <p className="text-red-400">{errors.emailOrUsername.message}</p>
      )}
      <Input type="password" id="password" {...register("password")}>
        Password
      </Input>
      {errors.password && (
        <p className="text-red-400">{errors.password.message}</p>
      )}
      <Link to="/forgot" className="flex self-end text-zinc-300 cursor-pointer">
        Forgot Password?
      </Link>
      <Button className="w-full" loading={isPending}>
        Login
      </Button>
      <p className="text-zinc-300">
        Don't have an account yet?{" "}
        <Link to="/register" className="text-[#04A51E] font-bold">
          Create Account
        </Link>
      </p>
    </Form>
  );
}
