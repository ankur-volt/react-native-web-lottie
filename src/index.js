import React, { PureComponent, createRef } from 'react';
import { View } from 'react-native';
import lottie from 'lottie-web';

class Animation extends PureComponent {
  animationContainerRef = createRef();

  componentDidMount() {
    this.loadAnimation(this.props);

    // handle external progress (e.g., Animated.Value)
    if (typeof this.props.progress === 'object' && this.props.progress._listeners) {
      this.props.progress.addListener((progress) => {
        const { value } = progress;
        if (!this.anim) return;
        const frame = value / (1 / this.anim.getDuration(true));
        this.anim.goToAndStop(frame, true);
      });
    }
  }

  componentWillUnmount() {
    if (typeof this.props.progress === 'object' && this.props.progress._listeners) {
      this.props.progress.removeAllListeners();
    }

    if (this.anim) {
      this.anim.destroy();
      this.anim = null;
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // reload animation if source changes
    if (
      this.props.source &&
      nextProps.source &&
      this.props.source.nm !== nextProps.source.nm
    ) {
      this.loadAnimation(nextProps);
    }
  }

  loadAnimation = (props) => {
    if (this.anim) {
      this.anim.destroy();
    }

    const container = this.animationContainerRef.current;
    if (!container) return;

    this.anim = lottie.loadAnimation({
      container,
      animationData: props.source,
      renderer: 'svg',
      loop: props.loop || false,
      autoplay: props.autoPlay,
      rendererSettings: props.rendererSettings || {},
    });

    if (props.onAnimationFinish) {
      this.anim.addEventListener('complete', props.onAnimationFinish);
    }
  };

  play = (...frames) => {
    if (!this.anim) return;
    this.anim.playSegments(frames, true);
  };

  reset = () => {
    if (!this.anim) return;
    this.anim.stop();
  };

  render() {
    return (
      <View
        style={this.props.style}
        // On web, react-native's <View> is a <div>, so this ref points to a DOM node.
        ref={this.animationContainerRef}
      />
    );
  }
}

export default React.forwardRef((props, ref) => (
  <Animation
    {...props}
    ref={typeof ref === 'function' ? (instance) => ref(instance && instance.anim) : ref}
  />
));
