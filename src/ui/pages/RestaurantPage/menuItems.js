import { useDispatch, useSelector } from 'react-redux';
import { accessMenuForRestaurant, accessRestaurantMenuState } from '../../../features/restaurants/restaurantsSlice';
import {
  accessCart,
  accessCartItems,
  accessCartStatus,
  obtainNewCartAsyncThunk
} from '../../../features/cart/cartSlice';
import { useCallback, useEffect, useMemo } from 'react';
import { retrieveRestaurantByIdAsyncThunk } from '../../../features/address/addressSlice';
import { createMap, useUpdateCartHandler } from './hooks';
import { Button } from 'reactstrap';
import { IconCartPlus, IconPlus } from '../../elements/icons';
import { PaginatedTable } from '../../elements/paginatedTable';
import { usePrevious } from 'react-use';

export function MenuItems({ restaurantId }) {

  const dispatch = useDispatch();
  const menuState = useSelector(accessRestaurantMenuState(restaurantId));
  const emptyArr = useMemo(() => ([]), []);
  const menuList = useSelector(accessMenuForRestaurant(restaurantId, emptyArr));
  const cartItems = useSelector(accessCartItems());
  const cartItemsMap = useMemo(() => createMap(cartItems, i => i.id), [ cartItems ]);
  const dataSource = useMemo(() => menuList.map(item => cartItemsMap.has(item.id) ?
    Object.assign({ cart: cartItemsMap.get(item.id) }, item) :
    item), [ cartItemsMap, menuList ]);
  const cartId = useSelector(accessCart('id'));
  const cartStatus = useSelector(accessCartStatus());

  useEffect(() => {
    if (menuState) {
      return;
    }
    dispatch(retrieveRestaurantByIdAsyncThunk({ restaurantId }));
  }, [ dispatch, menuState, restaurantId ]);

  useEffect(() => {
    if (cartStatus) {
      return;
    }
    dispatch(obtainNewCartAsyncThunk());
  }, [ cartStatus, dispatch ]);


  const handleAddToCart = useUpdateCartHandler(cartId, cartItemsMap, restaurantId);

  const actionColumnFormatter = useCallback((cellContent, row, rowId, cartId) => {
    console.log('menuItems - actionColumnFormatter', { cartId });
    if (row.cart) {
      const cartItem = row.cart;
      return <Button color={ 'success' } size={ 'sm' } disabled={ !cartId || (cartItem.oldCount !== undefined) }
        onClick={ handleAddToCart(row.id, row, cartItem, 1) }><IconPlus /></Button>;
    }
    return <Button color={ 'info' } size={ 'sm' } disabled={ !cartId } onClick={ handleAddToCart(row.id, row, null, 1) }><IconCartPlus /></Button>;
  }, [ handleAddToCart ]);

  const columns = useMemo(() => ([
    {
      dataField: 'id',
      text: 'Ref ID',
      sort: true
    }, {
      dataField: 'name',
      text: 'Food Item',
      sort: true
    }, {
      dataField: 'cuisine_name',
      text: 'Cuisine',
      sort: true
    }, {
      dataField: 'category_name',
      text: 'Category',
      sort: true
    }, {
      dataField: 'price',
      text: 'Price',
      sort: true
    }, {
      dataField: 'actions',
      isDummyField: true,
      text: 'Add To Cart',
      formatter: actionColumnFormatter,
      formatExtraData: cartId,
      classes: 'text-right'
    }
  ]), [ actionColumnFormatter, cartId ]);

  const defaultSorted = [ {
    dataField: 'name',
    order: 'desc'
  } ];

  const x = {
    'id': '224474',
    'name': 'Chicken Livers and Portuguese Roll',
    'position': 1,
    'price': '250.00',
    'consumable': '1:1',
    'cuisine_name': 'Indian',
    'category_name': 'Appeteasers',
    'discount': {
      'type': '',
      'amount': '0.00'
    },
    'tags': []
  };

  void x;

  const prevcartId = usePrevious(cartId);
  console.log(prevcartId, ' => ', cartId);

  if (menuState !== 'ready') {
    return <>Updating the menu...</>;
  }

  return <PaginatedTable
    bootstrap4
    hover
    keyField="id"
    data={ dataSource }
    noDataIndication={ <>Menu is temporarily empty</> }
    columns={ columns }
    defaultSorted={ defaultSorted }
    bordered={ false }
    paginationOnTop
    paginationFactoryOptions={ {
      custom: true,
      sizePerPage: 5,
      sizePerPageList: [ 5, 10, 25, 30, 50 ],
      hidePageListOnlyOnePage: true
    } }
  />;

}
