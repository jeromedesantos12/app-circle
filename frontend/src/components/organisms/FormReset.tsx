import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { isAxiosError } from "axios";
import { usersKeys, resetUser } from "../../queries/user";
import { Input, Button, Alert } from "../atoms";
import { Form } from "../molecules";
import { resetSchema, type ResetFormData } from "../../schema/reset";

export function FormReset({ id }: { id: string }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  const navigate = useNavigate();
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: (data: ResetFormData) => resetUser(id, data),
    onSuccess: () => {
      navigate("/login");
    },
  });

  function onSubmit(data: ResetFormData) {
    mutate(data);
  }
  return (
    <Form title="Reset password" onSubmit={handleSubmit(onSubmit)}>
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response
            ? error.response.data.message
            : error.message}
        </Alert>
      )}
      <Input type="password" id="password" {...register("password")}>
        Password
      </Input>
      {errors.password && (
        <p className="text-red-400">{errors.password.message}</p>
      )}
      <Input type="password" id="confirmPassword" {...register("newPassword")}>
        Confirm New Password
      </Input>
      {errors.newPassword && (
        <p className="text-red-400">{errors.newPassword.message}</p>
      )}
      <Button className="w-full" loading={isPending}>
        Create New Password
      </Button>
    </Form>
  );
}
