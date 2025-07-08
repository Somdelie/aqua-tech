

export interface Category {
  id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
    parent: { id: string; name: string } | null;
    children: Array<{ id: string; name: string }>;
    _count: { products: number };
    createdAt: Date;
    updatedAt: Date;
}