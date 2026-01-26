import { NextResponse } from "next/server";

export async function GET() {
  try {
    // CarAPI.app (gratuite, dataset 2015-2020 sans clé)
    const response = await fetch(
      "https://carapi.app/api/makes",
      { next: { revalidate: 86400 } } // Cache 24h
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch from CarAPI");
    }
    
    const data = await response.json();
    const makes = data.data
      ?.map((item: any) => item.name)
      .filter((name: string) => name && name.length > 0)
      .sort() || [];
    
    return NextResponse.json({ success: true, makes });

  } catch (error) {
    console.error("Error fetching makes:", error);
    return NextResponse.json(
      { error: "Failed to fetch makes" },
      { status: 500 }
    );
  }
}
