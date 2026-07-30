import React, { forwardRef } from 'react';
import PagerView from 'react-native-pager-view';

type Props = {
  children: React.ReactNode;
  initialPage?: number;
  onPageSelected: (e: { nativeEvent: { position: number } }) => void;
};

const SwipePager = forwardRef<PagerView, Props>(
  ({ children, initialPage = 0, onPageSelected }, ref) => {
    return (
      <PagerView
        ref={ref}
        style={{ flex: 1 }}
        initialPage={initialPage}
        onPageSelected={onPageSelected}
      >
        {children}
      </PagerView>
    );
  }
);

export default SwipePager;