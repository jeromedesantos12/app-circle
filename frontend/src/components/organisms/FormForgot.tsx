import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { usersKeys, forgotUser } from "../../queries/user";
import { Input, Button, Alert } from "../atoms";
import { Form } from "../molecules";
import { forgotSchema, type ForgotFormData } from "../../schema/forgot";

export function FormForgot() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: "",
    },
  });
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: forgotUser,
    onSuccess: (data) => {
      alert("bcript: " + data.data.password);
      navigate("/login");
    },
  });

  function onSubmit(data: ForgotFormData) {
    mutate(data);
  }

  return (
    <Form title="Forgot password" onSubmit={handleSubmit(onSubmit)}>
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response
            ? error.response.data.message
            : error.message}
        </Alert>
      )}

      <Input type="email" id="email" {...register("email")}>
        Email
      </Input>
      {errors.email && <p className="text-red-400">{errors.email.message}</p>}
      <Button className="w-full" loading={isPending}>
        Send Instruction
      </Button>
      <p className="text-zinc-300">
        Already have account?{" "}
        <Link to="/login" className="text-[#04A51E] font-bold">
          Login
        </Link>
      </p>
    </Form>
  );
}
