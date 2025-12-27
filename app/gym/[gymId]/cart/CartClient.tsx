'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import CartItemRow from '@/lib/components/CartItemRow'
import CartSummary from '@/lib/components/CartSummary'
import { proceedToCheckout, updateCartLine, removeCartLine } from '@/lib/shopify/cart'
import { Cart } from '@/lib/shopify/types'

export default function CartClient({ gymId, cart }: { gymId: string; cart: Cart }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleQuantityChange = (lineId: string, quantity: number) => {
    startTransition(async () => {
      try {
        await updateCartLine({ lineId, quantity })
        router.refresh()
      } catch (error) {
        console.error(error)
        alert('数量の更新に失敗しました。再読み込みしてください。')
      }
    })
  }

  const handleRemove = (lineId: string) => {
    startTransition(async () => {
      try {
        await removeCartLine({ lineId })
        router.refresh()
      } catch (error) {
        console.error(error)
        alert('商品の削除に失敗しました。再読み込みしてください。')
      }
    })
  }

  const handleCheckout = () => {
    startTransition(async () => {
      try {
        const result = await proceedToCheckout()

        if (!result.ok) {
          alert(result.reason)
          router.refresh()
          return
        }

        window.location.href = result.checkoutUrl
      } catch (e) {
        alert('決済処理に失敗しました')
      }
    })
  }

  return (
    <div>
      {cart.lines.map((line) => (
        <CartItemRow
          key={line.id}
          line={line}
          onQuantityChange={handleQuantityChange}
          onRemove={handleRemove}
          disabled={isPending}
        />
      ))}

      <CartSummary
        totalAmount={cart.cost.totalAmount}
        disabled={isPending}
        onCheckout={() => {
          handleCheckout()
        }}
      />
    </div>
  )
}
