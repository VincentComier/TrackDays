import { NextRequest, NextResponse } from "next/server";

interface VehicleSearchResult {
  make: string;
  model: string;
  year?: number;
  trim?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const make = searchParams.get("make");
  const year = searchParams.get("year");

  if (!make) {
    return NextResponse.json(
      { error: "Make parameter is required" },
      { status: 400 }
    );
  }

  try {
    // CarAPI.app v2 (gratuite, dataset 2015-2020 sans clé)
    const params = new URLSearchParams({ make });
    if (year) params.append("year", year);
    
    const url = `https://carapi.app/api/models/v2?${params.toString()}`;
    const response = await fetch(url, {
      next: { revalidate: 3600 } // Cache 1h
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch from CarAPI");
    }
    
    const data = await response.json();
    
    const vehicles: VehicleSearchResult[] = data.data
      ?.map((item: any) => ({
        make: item.make || make,
        model: item.name,
        year: year ? parseInt(year) : undefined,
      }))
      .sort((a: VehicleSearchResult, b: VehicleSearchResult) => 
        a.model.localeCompare(b.model)
      ) || [];

    return NextResponse.json({ success: true, vehicles });

  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Failed to search vehicles" },
      { status: 500 }
    );
  }
}
