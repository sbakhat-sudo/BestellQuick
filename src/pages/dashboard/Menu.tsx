import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCreateMenuItem, useDeleteMenuItem, useMenuItems, useUpdateMenuItem } from '@/hooks/useMenuItems'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { MenuItemFormModal } from '@/components/menu/MenuItemFormModal'
import type { MenuItem } from '@/types/database.types'

export default function Menu() {
  const { t } = useTranslation()
  const { data: items, isLoading } = useMenuItems()
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()
  const deleteItem = useDeleteMenuItem()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<MenuItem | undefined>(undefined)

  const grouped = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of items ?? []) {
      const list = map.get(item.category) ?? []
      list.push(item)
      map.set(item.category, list)
    }
    return Array.from(map.entries())
  }, [items])

  const openAdd = () => {
    setEditing(undefined)
    setModalOpen(true)
  }

  const openEdit = (item: MenuItem) => {
    setEditing(item)
    setModalOpen(true)
  }

  const onDelete = async (id: string) => {
    if (window.confirm(t('menu.confirmDelete'))) {
      await deleteItem.mutateAsync(id)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">{t('menu.title')}</h1>
        <Button onClick={openAdd}>{t('menu.addItem')}</Button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : !items || items.length === 0 ? (
        <p className="text-neutral-500">{t('menu.noItems')}</p>
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(([category, categoryItems]) => (
            <div key={category}>
              <h2 className="mb-2 text-lg font-semibold text-neutral-900">{category}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categoryItems.map((item) => (
                  <Card key={item.id}>
                    <CardBody className="flex gap-3">
                      {item.photo_url ? (
                        <img src={item.photo_url} alt="" className="size-16 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <div className="size-16 shrink-0 rounded-lg bg-neutral-100" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-semibold text-neutral-900">{item.name}</p>
                          <Badge tone={item.status === 'available' ? 'success' : 'danger'}>
                            {item.status === 'available' ? t('menu.available') : t('menu.outOfStock')}
                          </Badge>
                        </div>
                        {item.description && <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{item.description}</p>}
                        <p className="mt-1 font-semibold text-brand-700">
                          {Number(item.price).toFixed(2)} {t('common.currency')}
                        </p>
                        <div className="mt-2 flex gap-3">
                          <button type="button" onClick={() => openEdit(item)} className="text-xs font-semibold text-neutral-700 hover:underline">
                            {t('common.edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem.mutate({
                                id: item.id,
                                patch: { status: item.status === 'available' ? 'out_of_stock' : 'available' },
                              })
                            }
                            className="text-xs font-semibold text-neutral-700 hover:underline"
                          >
                            {item.status === 'available' ? t('menu.outOfStock') : t('menu.available')}
                          </button>
                          <button type="button" onClick={() => onDelete(item.id)} className="text-xs font-semibold text-red-600 hover:underline">
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuItemFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={async (input) => {
          if (editing) {
            await updateItem.mutateAsync({ id: editing.id, patch: input })
          } else {
            await createItem.mutateAsync(input)
          }
        }}
      />
    </div>
  )
}
