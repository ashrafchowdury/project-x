import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/libs/query";
import { POST_TYPE, UserId } from "@/utils/types";
import { toast } from "sonner";
import { PostsSchema } from "../../libs/validations";
import axios from "axios";

// constants
const KEY = ["bookmarks"];
const RETRY = 3;

export const useFetchBookmarks = ({ userId }: UserId) => {
  const fetcher = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await axios.get(`api/${userId}/bookmarks`);

      if (res.status >= 400) return;

      const validateData = PostsSchema.safeParse(res.data);

      if (!validateData.success) {
        throw new Error(validateData.error.message);
      }

      return validateData.data;
    },
    refetchOnWindowFocus: false,
    retry: RETRY,
    enabled: !!userId,
  });

  return fetcher;
};

export const useUpdateBookmark = ({ userId }: UserId) => {
  const updatetor = useMutation({
    mutationKey: KEY,
    mutationFn: async (data: POST_TYPE) => {
      const res = await axios.post(`api/${userId}/bookmarks`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status >= 400) return;

      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, (prevData: POST_TYPE[]) => [
        ...prevData,
        data,
      ]);
      toast("✅ Bookmaked the post");
    },
    onError: () => {
      toast.error("❌ Failed to save post, please try again later");
    },
    retry: RETRY,
  });

  return updatetor;
};

export const useDeleteBookmark = ({ userId }: UserId) => {
  const dispatcher = useMutation({
    mutationKey: KEY,
    mutationFn: async (postId: string) => {
      await fetch(`api/${userId}/bookmarks`, {
        method: "DELETE",
        body: JSON.stringify({ postId: postId }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      return postId;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(KEY, (prevData: POST_TYPE[]) =>
        prevData.filter((item) => item.id !== data)
      );
      toast("✅ Removed post from bookmark");
    },
    onError: () => {
      toast.error("❌ Failed to delete bookmark, please try again later");
    },
    retry: RETRY,
  });

  return dispatcher;
};
