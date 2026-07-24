import { useEffect, useState } from 'react'
import { listProducts, createProduct, updateProduct } from '../../services/productRepository.js'
import { PRODUCT_CATEGORY, CATEGORY_LABEL } from '../../models/index.js'
import { TextField, Select, PrimaryButton, FieldLabel } from '../../components/FormControls.jsx'
import { CategoryTag } from '../../components/CategoryTag.jsx'

const CATEGORY_OPTIONS = Object.values(PRODUCT_CATEGORY).map((c) => ({ value: c, label: CATEGORY_LABEL[c] }))
const EMPTY = { name: '', category: PRODUCT_CATEGORY.OTHER, unit: '', icon: '📦' }

function ProductRow({ product, onSave }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(product)

  async function submit(e) {
    e.preventDefault()
    await onSave(product.id, form)
    setEditing(false)
  }

  if (!editing) {
    return (
      <tr className="border-b border-line last:border-0">
        <td className="p-3 text-lg">{product.icon}</td>
        <td className="p-3 font-bold">{product.name}</td>
        <td className="p-3"><CategoryTag category={product.category} /></td>
        <td className="p-3 text-inksoft">{product.unit}</td>
        <td className="p-3 text-right">
          <button onClick={() => setEditing(true)} className="rounded-md border border-linestrong px-2 py-1 text-[11px] font-bold text-teal">
            Edit
          </button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-line bg-bg last:border-0">
      <td className="p-2"><TextField value={form.icon} onChange={(v) => setForm((f) => ({ ...f, icon: v }))} /></td>
      <td className="p-2"><TextField value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} /></td>
      <td className="p-2"><Select value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} options={CATEGORY_OPTIONS} /></td>
      <td className="p-2"><TextField value={form.unit} onChange={(v) => setForm((f) => ({ ...f, unit: v }))} /></td>
      <td className="p-2 text-right">
        <form onSubmit={submit} className="inline-flex gap-1">
          <button type="submit" className="rounded-md bg-accent px-2 py-1 text-[11px] font-bold text-accentink">Save</button>
          <button type="button" onClick={() => { setForm(product); setEditing(false) }} className="rounded-md border border-linestrong px-2 py-1 text-[11px] font-bold text-inksoft">
            Cancel
          </button>
        </form>
      </td>
    </tr>
  )
}

export function AdminProducts() {
  const [products, setProducts] = useState(null)
  const [newProduct, setNewProduct] = useState(EMPTY)
  const [error, setError] = useState(null)

  async function reload() {
    setProducts(await listProducts())
  }

  useEffect(() => {
    reload()
  }, [])

  async function save(id, form) {
    await updateProduct(id, form)
    await reload()
  }

  async function submitNew(e) {
    e.preventDefault()
    if (!newProduct.name.trim()) {
      setError('Product name is required.')
      return
    }
    setError(null)
    await createProduct(newProduct)
    setNewProduct(EMPTY)
    await reload()
  }

  if (!products) return <div className="py-10 text-center text-sm text-inkfaint">Loading…</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Product catalog</h1>
        <p className="text-sm text-inksoft">
          Two ways a product ends up here: a Vasuki types a new name during Stage 1 (auto-created with placeholder icon/category), or you
          add one directly below, already tagged properly. Edit any row to fix a placeholder.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[10px] uppercase text-inkfaint">
              <th className="p-3">Icon</th>
              <th className="p-3">Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Unit</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow key={p.id} product={p} onSave={save} />
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={submitNew} className="rounded-xl border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-bold">+ Add a product directly</h2>
        <div className="grid gap-3 sm:grid-cols-4">
          <div><FieldLabel>Icon (emoji)</FieldLabel><TextField value={newProduct.icon} onChange={(v) => setNewProduct((f) => ({ ...f, icon: v }))} /></div>
          <div><FieldLabel>Name</FieldLabel><TextField value={newProduct.name} onChange={(v) => setNewProduct((f) => ({ ...f, name: v }))} /></div>
          <div><FieldLabel>Category</FieldLabel><Select value={newProduct.category} onChange={(v) => setNewProduct((f) => ({ ...f, category: v }))} options={CATEGORY_OPTIONS} /></div>
          <div><FieldLabel>Unit</FieldLabel><TextField value={newProduct.unit} onChange={(v) => setNewProduct((f) => ({ ...f, unit: v }))} placeholder="pkt / kg / ltr / pcs" /></div>
        </div>
        {error && <p className="mt-2 text-[11px] font-bold text-crit">{error}</p>}
        <div className="mt-3"><PrimaryButton type="submit" className="w-full sm:w-auto">Add product</PrimaryButton></div>
      </form>
    </div>
  )
}
