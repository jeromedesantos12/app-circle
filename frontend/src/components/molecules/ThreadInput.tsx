import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type SetStateAction,
  type MouseEvent,
  useRef,
  useEffect,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import { useSelector } from "react-redux";
import { isAxiosError } from "axios";
import type { RootState } from "../../redux/store";
import { Alert, Button, ImgPreview, ImgProfile } from "../atoms";
import { postThread, threadsKeys } from "../../queries/thread";

export function ThreadInput({
  hide,
  setHide,
}: {
  hide: boolean;
  setHide: React.Dispatch<SetStateAction<boolean>>;
}) {
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: threadsKeys.all,
    mutationFn: postThread,
    onSuccess: () => {
      setHide(!hide);
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

  function handleExit() {
    setHide(!hide);
  }

  useEffect(() => {
    if (content === "" && image === null) {
      setButtonDisabled(true);
    } else {
      setButtonDisabled(false);
    }
  }, [content, image]);

  return (
    <div
      className={`w-full min-h-screen flex flex-col justify-center bg-zinc-950/70 fixed z-20
        ${hide ? "" : "hidden"}  
     `}
    >
      <div
        className={`w-full max-w-2xl flex flex-col gap-5 cursor-text p-5 border-zinc-300 bg-zinc-900 rounded-xl z-40
       
    `}
      >
        <X
          className="text-zinc-300 self-end p-1 -mb-2 rounded-full border-2 border-zinc-300 cursor-pointer"
          onClick={handleExit}
        />
        {isError && (
          <Alert variant="danger">
            {isAxiosError(error) && error.response
              ? error.response.data.message
              : error.message}
          </Alert>
        )}
        <form
          className="flex flex-col gap-5"
          action="submit"
          onSubmit={handleSubmit}
        >
          <div className="flex gap-5 w-full border-b-1 border-zinc-700 z-40 pr-5">
            <ImgProfile
              src={userUrl}
              alt={`Image of ${userUrl}`}
              className="w-10 h-10"
            />
            <textarea
              placeholder="What is happening?!"
              value={content}
              className="placeholder:text-zinc-500 text-lg w-full outline-none text-zinc-300 bg-zinc-900 resize-none h-30 caret-[#04A51E]"
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex w-full justify-between">
            <label htmlFor="image" className=" cursor-pointer">
              <input
                id="image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />
              <ImagePlus size="30" className="brightness-70 text-[#04A51E]" />
            </label>
            <Button disabled={buttonDisabled} loading={isPending}>
              Post
            </Button>
          </div>
          {base64Image && (
            <ImgPreview
              onClick={handleClose}
              src={base64Image}
              alt={`Image of ${data?.username}`}
            />
          )}
        </form>
      </div>
    </div>
  );
}
