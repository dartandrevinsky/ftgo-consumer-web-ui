import { debugged } from '../../../shared/diagnostics';
import { useDispatch } from 'react-redux';
import { useMemo } from 'react';
import curry from 'lodash-es/curry';
import { updateCartWithItemAsyncThunk } from '../../../features/cart/cartSlice';

/**
 *
 * @param cartId
 * @param cartItemsMap
 * @param selectedRestaurantId
 * @return {*|(function(*, *): function(*): (function(...[*]): (*|undefined))|*)}
 */
export function useUpdateCartHandler(cartId, cartItemsMap, selectedRestaurantId) {
  const dummyHandler = (a, b) => (c) => debugged([ a, b, c ]);

  const dispatch = useDispatch();
  return useMemo(() => cartId ? curry((itemId, menuItem, cartItem, diff, _) => {
    const item = cartItem || { count: 0, name: menuItem?.name, price: menuItem?.price };
    const restaurantId = selectedRestaurantId ?? (item.meta?.restaurantId ?? null);
    if (typeof item.oldCount !== 'undefined') {
      return;
    }
    dispatch(updateCartWithItemAsyncThunk({
      cartId,
      restaurantId,
      itemId,
      qty: Math.max(0, item.count + diff),
      item
    }));
    debugger;
  }) : dummyHandler, [ cartId, selectedRestaurantId, dispatch ]);
}

export function createMap(arr, idGetter) {
  return new Map(arr.map(i => [ idGetter(i), i ]));
}
