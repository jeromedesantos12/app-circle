import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useRef,
  useEffect,
} from "react";
import { isAxiosError } from "axios";
import { ImagePlus } from "lucide-react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { Alert, Button, ImgPreview, ImgProfile } from "../atoms";
import { repliesKeys, postReplies } from "../../queries/reply";
import type { RootState } from "../../redux/store";

export function ThreadAdd({
  threadId,
  placeholder,
  onClick,
  disabled = false,
}: {
  threadId?: string;
  placeholder?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: repliesKeys.all,
    mutationFn: (formData: FormData) =>
      postReplies(formData, threadId as string),
    onSuccess: () => {
      setContent("");
      setImage(null);
      setBase64Image(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [content, setContent] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const { data } = useSelector((state: RootState) => state.userById);
  const baseURL: string = import.meta.env.VITE_BASE_URL;
  const userUrl =
    data?.photo_profile && `${baseURL}/uploads/${data.photo_profile}`;

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.length ? e.target.files[0] : null;
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setBase64Image(reader.result);
      }
    };
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("content", content);
    mutate(formData);
  }

  function handleClose(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation();
    setImage(null);
    setBase64Image(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (content === "" && image === null) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [content, image]);

  return (
    <form
      action="submit"
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 cursor-text p-5 bg-zinc-900"
      onClick={onClick}
    >
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response
            ? error.response.data.message
            : error.message}
        </Alert>
      )}
      <div
        className="flex gap-5 items-center
      "
      >
        {data && (
          <ImgProfile
            src={userUrl}
            alt={`Image of ${userUrl}`}
            className="w-10 h-10"
          />
        )}
        <input
          className="text-zinc-300 placeholder:text-zinc-500 text-lg w-full outline-none bg-zinc-900 resize-none h-10 caret-[#04A51E] "
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          readOnly={disabled}
        />
        <div className="flex items-center gap-5">
          <div className="flex w-full justify-between">
            <label htmlFor="image" className=" cursor-pointer">
              <input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                disabled={disabled}
                onChange={handleImageChange}
                hidden
              />
              <ImagePlus size="30" className="brightness-70 text-[#038318]" />
            </label>
          </div>
          <Button loading={isPending} disabled={disabled || buttonDisabled}>
            {disabled ? "Post" : "Reply"}
          </Button>
        </div>
      </div>
      {base64Image && (
        <ImgPreview
          onClick={handleClose}
          src={base64Image}
          alt={`Image of ${data?.username}`}
        />
      )}
    </form>
  );
}
