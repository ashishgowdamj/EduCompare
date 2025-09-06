import { StyleProp, ViewStyle } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInRight, 
  SlideInLeft, 
  SlideInDown, 
  ZoomIn, 
  ZoomOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  SharedValue,
  AnimatedStyleProp,
  withSpring as withSpringUtil,
  withTiming as withTimingUtil,
  interpolate,
  Extrapolate,
  Easing,
} from 'react-native-reanimated';

interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Reusable animation components
export const FadeInView = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style = {} 
}: AnimationProps) => (
  <Animated.View 
    entering={FadeIn.delay(delay).duration(duration)}
    style={style}
  >
    {children}
  </Animated.View>
);

export const SlideInRightView = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style = {} 
}: AnimationProps) => (
  <Animated.View 
    entering={SlideInRight.delay(delay).duration(duration)}
    style={style}
  >
    {children}
  </Animated.View>
);

export const SlideInLeftView = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style = {} 
}: AnimationProps) => (
  <Animated.View 
    entering={SlideInLeft.delay(delay).duration(duration)}
    style={style}
  >
    {children}
  </Animated.View>
);

export const SlideInDownView = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style = {} 
}: AnimationProps) => (
  <Animated.View 
    entering={SlideInDown.delay(delay).duration(duration)}
    style={style}
  >
    {children}
  </Animated.View>
);

export const ZoomInView = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  style = {} 
}: AnimationProps) => (
  <Animated.View 
    entering={ZoomIn.delay(delay).duration(duration)}
    style={style}
  >
    {children}
  </Animated.View>
);

// Animation presets
export const cardAnimation = {
  enter: FadeIn.duration(600),
  exit: FadeOut.duration(300),
};

export const listItemAnimation = (index: number) => ({
  enter: SlideInRight.delay(100 * index).duration(500),
  exit: FadeOut.duration(200),
});

// Interactive animations
export const pressInAnimation = (value: Animated.SharedValue<number>) => {
  'worklet';
  return {
    transform: [{ scale: value }],
  };
};

// Shared values for interactive animations
export const useCardPressAnimation = () => {
  const animatedValue = useSharedValue(1);
  
  const onPressIn = useCallback(() => {
    Animated.spring(animatedValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const onPressOut = useCallback(() => {
    Animated.spring(animatedValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [animatedValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: animatedValue.value }],
  }));

  return { onPressIn, onPressOut, animatedStyle };
};
