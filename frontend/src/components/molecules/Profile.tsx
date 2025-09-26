import { useRef, useState, type ChangeEvent } from "react";
import { Alert, ButtonProfile, ButtonTrash, ImgProfile } from "../atoms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { userSchema, type UserSchema } from "../../schema/user";
import { useMutation } from "@tanstack/react-query";
import { updateUser, usersKeys } from "@/queries/user";
import { isAxiosError } from "axios";
import { ButtonDone } from "../atoms/ButtonDone";

export function Profile({
  id,
  full_name,
  username,
  photo_profile,
  bio,
  totalFollowing,
  totalFollowers,
  pending = false,
}: {
  id: string;
  username?: string;
  full_name: string;
  email: string;
  photo_profile?: string;
  bio?: string;
  totalFollowing?: number;
  totalFollowers?: number;
  pending?: boolean;
}) {
  const baseURL: string = import.meta.env.VITE_BASE_URL;
  const userUrl = photo_profile && `${baseURL}/uploads/${photo_profile}`;
  const fileInputRef = useRef(null);
  const [edit, setEdit] = useState(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(
    userUrl || null
  );
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: (formData: FormData) => updateUser(id, formData),
    onSuccess: () => {
      setRemove(null);
      setEdit(!edit);
      reset();
    },
  });

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.length ? e.target.files[0] : null;
    if (!file) return;
    setImage(file);
    setRemove(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      full_name: full_name,
      username: username ?? "",
      bio: bio ?? "",
    },
  });

  function onSubmit(data: UserSchema) {
    const formData = new FormData();
    if (image) formData.append("photo_profile", image);
    if (remove) formData.append("remove", remove);
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    mutate(formData);
  }

  return (
    <div
      className={`${
        pending && "brightness-50 animate-pulse"
      } bg-zinc-900 flex w-full flex-col rounded-b-2xl px-5 py-10 gap-5`}
    >
      <div className="flex justify-between items-end">
        <div className="relative">
          <div className="relative">
            <input
              className="bg-transparent w-20 h-20 rounded-full absolute cursor-pointer text-transparent"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden={!edit}
            />
            <ImgProfile
              src={base64Image}
              alt={`Image of ${full_name}`}
              className="w-20 h-20"
            />
          </div>
          <ButtonTrash
            onClick={() => {
              setRemove("ok");
              setBase64Image(null);
            }}
            className="absolute bottom-0 -right-7"
            hidden={!edit}
          />
        </div>
        <ButtonProfile
          onClick={() => {
            setBase64Image(userUrl || null);
            setRemove(null);
            setEdit(!edit);
            reset();
          }}
          loading={pending}
          active={edit}
        >
          {edit ? "Cancel" : "Edit Profile"}
        </ButtonProfile>
      </div>
      <div hidden={edit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col">
            <h1 className="text-zinc-300 font-bold text-xl">{full_name}</h1>
            <p className="text-zinc-500">@{username}</p>
          </div>
          <p className="text-zinc-300">{bio}</p>
        </div>
        <div className="flex gap-5">
          <div className="flex gap-2">
            <span className="text-zinc-300 font-bold">{totalFollowing}</span>
            <p className="text-zinc-500">Following</p>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-300 font-bold">{totalFollowers}</span>
            <p className="text-zinc-500">Followers</p>
          </div>
        </div>
      </div>
      <form
        hidden={!edit}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        {isError && (
          <Alert variant="danger">
            {isAxiosError(error) && error.response
              ? error.response.data.message
              : error.message}
          </Alert>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="full_name" className="text-zinc-300 font-bold">
            Full Name
          </label>
          <input
            id="full_name"
            type="text"
            placeholder={"Insert full name.."}
            {...register("full_name")}
            className="placeholder:text-zinc-500 text-sm w-full border-b-1 border-zinc-700 outline-none text-zinc-300 bg-zinc-900 caret-[#04A51E]"
          />
          {errors.full_name && (
            <span className="text-red-500 text-sm">
              {errors.full_name.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="username" className="text-zinc-300 font-bold">
            Username
          </label>
          <div className="flex gap-1 items-center">
            <span className="text-zinc-500 font-bold">@</span>
            <input
              id="username"
              type="text"
              placeholder={"Insert username.."}
              {...register("username")}
              className="placeholder:text-zinc-500 text-sm w-full border-b-1 border-zinc-700 outline-none text-zinc-300 bg-zinc-900 caret-[#04A51E]"
            />
          </div>
          {errors.username && (
            <span className="text-red-500 text-sm">
              {errors.username.message}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="bio" className="text-zinc-300 font-bold">
            Bio
          </label>
          <input
            id="bio"
            type="text"
            placeholder={"Insert bio.."}
            {...register("bio")}
            className="placeholder:text-zinc-500 text-sm w-full border-b-1 border-zinc-700 outline-none text-zinc-300 bg-zinc-900 caret-[#04A51E]"
          />
          {errors.bio && (
            <span className="text-red-500 text-sm">{errors.bio.message}</span>
          )}
        </div>
        <ButtonDone className="w-full" loading={isPending}>
          Done
        </ButtonDone>
      </form>
    </div>
  );
}
