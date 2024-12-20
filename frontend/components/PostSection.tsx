"use client";

import Link from "next/link";
import React from "react";

import { useEffect, useState } from "react";

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
const PostSection = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/posts`
        );
        console.log("Response", response);

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

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <Link
                href={`/post/${post.id}`}
                className="text-xl font-semibold mb-2 text-blue-500 underline"
              >
                {post.title}
              </Link>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {post.content}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  {post.author && (
                    <>
                      <span className="font-medium">{post.author.name}</span>
                      <span className="mx-2">•</span>
                    </>
                  )}
                  <time>{new Date(post.createdAt).toLocaleDateString()}</time>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found</p>
        </div>
      )}
    </>
  );
};

export default PostSection;
