import React, { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';

type Props = {
  children: React.ReactNode;
  initialPage?: number;
  onPageSelected: (e: { nativeEvent: { position: number } }) => void;
};

export type SwipePagerWebHandle = {
  setPage: (index: number) => void;
};

const SwipePager = forwardRef<SwipePagerWebHandle, Props>(
  ({ children, initialPage = 0, onPageSelected }, ref) => {
    const [page, setPage] = React.useState(initialPage);

    useImperativeHandle(ref, () => ({
      setPage: (index: number) => {
        setPage(index);
        onPageSelected({ nativeEvent: { position: index } });
      },
    }));

    const items = React.Children.toArray(children);

    return <View style={{ flex: 1 }}>{items[page]}</View>;
  }
);

export default SwipePager;