import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { UsdaFoodDetailResponse, UsdaSearchResponse } from './usda.types';

@Injectable()
export class UsdaClient {
  private readonly baseUrl =
    process.env.USDA_BASE_URL ?? 'https://api.nal.usda.gov/fdc/v1';

  // USDA API key is required for live calls; this guard returns actionable guidance.
  private assertApiKey(): string {
    const key = process.env.USDA_API_KEY;
    if (!key || key.trim().length === 0) {
      throw new ServiceUnavailableException(
        'USDA_API_KEY is not configured. Set it in apps/api/.env to enable food search.',
      );
    }
    return key;
  }

  async searchFoods(
    query: string,
    pageSize: number,
  ): Promise<UsdaSearchResponse> {
    const apiKey = this.assertApiKey();

    const url = new URL(`${this.baseUrl}/foods/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('pageSize', String(pageSize));
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `USDA search request failed with ${response.status}`,
      );
    }

    return (await response.json()) as UsdaSearchResponse;
  }

  async getFoodDetail(fdcId: string): Promise<UsdaFoodDetailResponse> {
    const apiKey = this.assertApiKey();

    const url = new URL(`${this.baseUrl}/food/${fdcId}`);
    url.searchParams.set('api_key', apiKey);

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new ServiceUnavailableException(
        `USDA detail request failed with ${response.status}`,
      );
    }

    return (await response.json()) as UsdaFoodDetailResponse;
  }
}
