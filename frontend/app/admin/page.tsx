"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Author {
  id: string;
  name: string;
  email: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author?: Author;
}

interface PostFormData {
  title: string;
  content: string;
  authorId: string;
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    content: "",
    authorId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchPosts(), fetchAuthors()]);
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch authors");
      }
      const data = await response.json();
      setAuthors(data);

      // Set the first author as default if available
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, authorId: data[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch authors");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorId) {
      setError("Please select an author");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create post");
      }

      // Reset form
      setFormData({ title: "", content: "", authorId: authors[0]?.id || "" });
      // Refresh posts list
      await fetchPosts();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Home
          </Link>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <Link
          href="/admin/user"
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Manage Users
        </Link>
      </div>

      {/* Create Post Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Author
            </label>
            <select
              id="author"
              value={formData.authorId}
              onChange={(e) =>
                setFormData({ ...formData, authorId: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            >
              <option value="">Select an author</option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} ({author.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg mb-8">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold p-6 border-b dark:border-gray-700">
          Posts List
        </h2>
        <div className="divide-y dark:divide-gray-700">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-6 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-medium mb-1">{post.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {new Date(post.createdAt).toLocaleDateString()} by{" "}
                  {post.author?.name || "Unknown"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/post/${post.id}`}
                  className="text-blue-500 hover:text-blue-600"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No posts found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
