"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectCommentSchema = exports.insertCommentSchema = exports.selectPostSchema = exports.insertPostSchema = exports.selectUserSchema = exports.insertUserSchema = exports.commentsRelations = exports.comments = exports.postsRelations = exports.posts = exports.usersRelations = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const drizzle_orm_1 = require("drizzle-orm");
// User Schema
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    posts: many(exports.posts),
    comments: many(exports.comments),
}));
// Post Schema
exports.posts = (0, pg_core_1.pgTable)("posts", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    authorId: (0, pg_core_1.uuid)("author_id")
        .references(() => exports.users.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.postsRelations = (0, drizzle_orm_1.relations)(exports.posts, ({ one, many }) => ({
    author: one(exports.users, {
        fields: [exports.posts.authorId],
        references: [exports.users.id],
    }),
    comments: many(exports.comments),
}));
// Comments Schema
exports.comments = (0, pg_core_1.pgTable)("comments", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    content: (0, pg_core_1.text)("content").notNull(),
    postId: (0, pg_core_1.uuid)("post_id")
        .references(() => exports.posts.id)
        .notNull(),
    authorId: (0, pg_core_1.uuid)("author_id")
        .references(() => exports.users.id)
        .notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.commentsRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one }) => ({
    post: one(exports.posts, {
        fields: [exports.comments.postId],
        references: [exports.posts.id],
    }),
    author: one(exports.users, {
        fields: [exports.comments.authorId],
        references: [exports.users.id],
    }),
}));
// Zod Schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.selectUserSchema = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.insertPostSchema = (0, drizzle_zod_1.createInsertSchema)(exports.posts);
exports.selectPostSchema = (0, drizzle_zod_1.createSelectSchema)(exports.posts);
exports.insertCommentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.comments);
exports.selectCommentSchema = (0, drizzle_zod_1.createSelectSchema)(exports.comments);
