import { AddProductForm } from "@/components/add-product-form"

export default function AddProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Add New Product</h1>
      <AddProductForm />
    </div>
  )
}

