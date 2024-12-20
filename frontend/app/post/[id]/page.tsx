"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts/${params.id}`
        );
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Post not found");
          }
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPost();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Post not found</p>
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-600"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <nav className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            ← Back
          </button>
          <Link
            href="/admin"
            className="text-blue-500 hover:text-blue-600 ml-auto"
          >
            Admin Dashboard
          </Link>
        </nav>

        {/* Post Content */}
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

            {/* Metadata */}
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <time>
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.author && (
                <>
                  <span>•</span>
                  <span>By {post.author.name}</span>
                </>
              )}
            </div>

            {/* Content */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{post.content}</p>
            </div>
          </div>
        </article>

        {/* Author Info */}
        {post.author && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-2">About the Author</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{post.author.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {post.author.email}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
