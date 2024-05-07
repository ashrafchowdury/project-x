import { NextRequest, NextResponse } from "next/server";
import { cachePosts, getPostBatches } from "./cache-algorithm";
import prisma from "@/libs/prisma";

export async function GET(req: NextRequest, { params }: { params: { user: string } }) {
  const userId = params.user;

  try {
    if (!userId) {
      throw new Error("Unothorized request!");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user!");
    }

    const posts = await getPostBatches(userId);

    return NextResponse.json({ data: posts }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load history" }, { status: 400 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { user: string } }) {
  const { posts } = await req.json();
  const userId = params.user;
  try {
    if (!userId) {
      throw new Error("Unothorized request!");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Invalid user id");
    }

   const newHistory = await cachePosts(userId, posts);

    return NextResponse.json({ data: newHistory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save posts" }, { status: 400 });
  }
}