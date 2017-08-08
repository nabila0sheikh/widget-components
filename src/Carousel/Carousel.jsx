import React, { Component } from 'react';
import PropTypes from 'prop-types'
import { widgetModule } from 'kambi-widget-core-library';
import styles from './Carousel.scss'

import CarouselItem from './CarouselItem';

const getImageHeight = (image) => {
   return (image.height / image.width) * window.innerWidth;
}


class Carousel extends Component {

   constructor(props) {
      super(props);
      this.state = {
         isMouseEntered: false,
         selectedItem: props.selectedItem,
         animating: false,
         enterAnimation: { transform: 'translateX(0%)' }
      }
   }

   componentDidMount() {
      if (this.props.autoPlay) {
         this.setupAutoPlay()
      }
   }

   // componentDidMount() {
   //    this.autoSlide();
   //
   //    this.adaptHeight();
   //
   //    window.addEventListener('resize', () => {
   //       clearTimeout(this.resizeTimeout);
   //       this.resizeTimeout = setTimeout(() => this.adaptHeight(), 200);
   //    });
   // }

   // componentDidUpdate() {
   //    this.adaptHeight();
   // }

   // componentWillUnmount() {
   //    clearTimeout(this.resizeTimeout);
   // }

   // adaptHeight() {
   //    widgetModule.adaptWidgetHeight(getImageHeight(this.props.imageElem));
   // }
   //
   // nextImage(index) {
   //    if ( index !== this.state.currentIndex && this.state.animating === false) {
   //
   //       this.setState({
   //          newIndex: index,
   //          enterAnimation: { transform: 'translateX(-100%)', transition: 'transform 1000ms ease' },
   //          animating: true
   //       });
   //
   //       const slide = setTimeout(() => {
   //          this.setState({
   //             currentIndex: index,
   //             enterAnimation: { transform: 'translateX(0%)' },
   //             animating: false
   //          });
   //
   //          clearTimeout(slide);
   //       }, 1000);
   //
   //       slide
   //    }
   // }
   //
   // autoSlide() {
   //    const turnSlide = setTimeout(() => {
   //       this.nextImage(this.state.currentIndex + 1 < this.props.children.length ? this.state.currentIndex + 1 : 0);
   //       clearTimeout(turnSlide);
   //       this.autoSlide();
   //    }, 10000);
   // }

   setupAutoPlay() {
      this.autoPlay()
      const carouselWrapper = this.carouselWrapper

      if (this.props.stopOnHover && carouselWrapper) {
         carouselWrapper.addEventListener('mouseenter', () => this.stopOnHover())
         carouselWrapper.addEventListener('mouseleave', () => this.startOnHoverLeave())
      }
   }

   autoPlay() {
      if (!this.props.autoPlay) { return }

      this.timer = setTimeout(() => {
         this.increment()
      }, this.props.intervalTime);
   }

   clearAutoPlay() {
      if (!this.props.autoPlay) { return }

      clearTimeout(this.timer)
   }

   resetAutoPlay() {
      this.clearAutoPlay()
      this.autoPlay()
   }

   stopOnHover() {
      this.setState({ isMouseEntered: true })
      this.clearAutoPlay()
   }

   startOnHoverLeave() {
      this.setState({ isMouseEntered: false })
      this.autoPlay()
   }

   decrement(positions) {
      this.moveTo(this.state.selectedItem - (typeof positions === 'Number' ? positions : 1));
   }

   increment(positions) {
      this.moveTo(this.state.selectedItem + (typeof positions === 'Number' ? positions : 1));
   }

   moveTo(position) {
      const lastPosition = this.props.children.length - 1;

      if (position < 0 ) {
       position = this.props.infiniteLoop ?  lastPosition : 0;
      }

      if (position > lastPosition) {
       position = this.props.infiniteLoop ? 0 : lastPosition;
      }

      this.setState({
         // if it's not a slider, we don't need to set position here
         selectedItem: position
      });

      // don't reset auto play when stop on hover is enabled, doing so will trigger a call to auto play more than once
      // and will result in the interval function not being cleared correctly.
      if (this.props.autoPlay && this.state.isMouseEntered === false) {
         this.resetAutoPlay();
      }
   }


   getSliderStyles() {
      const currentPosition = `${-this.state.selectedItem * 100}%`

      const transformProp = `translate3d(${currentPosition}, 0, 0)`

      return {
         transform: transformProp,
         transitionDuration: this.props.transitionTime
      }
   }

   renderItems() {
      const { children } = this.props;

      if (!children || children.length === 0) {
         console.warn('No children warning');
         return null
      }

      return children.map((child, index) => (
         <CarouselItem key={`child-${index}`}>
            {child}
         </CarouselItem>
      ))
   }

   render () {
      const { children } = this.props;

      const sliderStyles = this.getSliderStyles()

      return (
         <div className={this.props.wrapperClassName} ref={el => this.carouselWrapper = el}>
            <div className='carousel-wrapper' style={{ width: this.props.width }}>
               <div className='slider-wrapper'>
                  <ul className='slider' style={sliderStyles}>
                     {/* Render Carousel Items */}
                     {this.renderItems()}
                  </ul>
               </div>

            </div>
         </div>
      )
   }
}

Carousel.defaultProps = {
   showIndicators: true,
   showArrows: true,
   infiniteLoop: true,
   legendClassName: null,
   wrapperClassName: null,
   selectedItem: 0,
   width: '100%',
   autoPlay: true,
   stopOnHover: true,
   intervalTime: 3000,
   transitionTime: 350,
   carouselItems: null, // [{ item: 'blah', }]
   redirectURL: null,
   redirectCallback: () => {}
}

Carousel.propTypes = {
   children: PropTypes.node.isRequired
};

Carousel.displayName = 'Carousel'

export default Carousel;
