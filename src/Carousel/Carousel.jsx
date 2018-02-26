import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './Carousel.scss'

import { resize } from '../helpers'

import leftChevron from './chevron_left.svg'
import rightChevron from './chevron_right.svg'

export default class Carousel extends Component {
  static propTypes = {
    showIndicators: PropTypes.bool,
    infiniteLoop: PropTypes.bool,
    legendClassName: PropTypes.string,
    wrapperClassName: PropTypes.string,
    cssEase: PropTypes.string,
    animationType: PropTypes.oneOf(['fade', 'slide']),
    selectedItem: PropTypes.number,
    height: PropTypes.string,
    autoPlay: PropTypes.bool,
    stopOnHover: PropTypes.bool,
    intervalDuration: PropTypes.number,
    transitionDuration: PropTypes.number,
    children: PropTypes.node,
    redirectCallback: PropTypes.func,
    onCarouselChange: PropTypes.func,
    onCarouselItemClick: PropTypes.func,
    onCarouselMouseEnter: PropTypes.func,
    onCarouselMouseLeave: PropTypes.func,
    initializedCarousel: PropTypes.func,
    imagesLoaded: PropTypes.func,
    indicatorUlStyles: PropTypes.shape(),
    indicatorLiStyles: PropTypes.shape(),
  }

  static defaultProps = {
    showIndicators: true,
    infinite: true,
    showArrows: true,
    infiniteLoop: true,
    legendClassName: null,
    wrapperClassName: null,
    cssEase: 'ease',
    animationType: 'slide',
    selectedItem: 0,
    height: '0px',
    autoPlay: false,
    stopOnHover: false,
    intervalDuration: 3500,
    transitionDuration: 800,
    redirectCallback: null,
    indicatorLiStyles: {},
    indicatorUlStyles: {},
    onCarouselChange: () => {},
    onCarouselMouseEnter: () => {},
    onCarouselMouseLeave: () => {},
    onCarouselItemClick: () => {},
    initializedCarousel: () => {},
    imageLoaded: () => {},
  }

  constructor(props) {
    super(props)
    this.autoPlayTimer = null
    this.changeTimer = null

    this.state = {
      isMouseEntered: false,
      currentPosition: props.selectedItem,
      lastPosition: null,
      carouselItems: [],
      cssAnimation: {},
      translate3d: null,
      initialized: false,
      fromChildren: false,
      disabled: false,
      previousArrowHover: false,
      nextArrowHover: false,
      selectedIndicator: null,
    }
  }

  componentDidMount() {
    const { children, autoPlay } = this.props

    if (children == null || children.length === 0) {
      return null
    }

    this.setupCarousel()
    resize.add(() => this.setupCarousel())

    if (autoPlay) {
      this.setupAutoPlay()
    }
  }

  componentDidUpdate() {
    if (!this.state.initialized) {
      this.setupCarousel()
    }

    if (this.props.autoPlay) {
      this.resetAutoPlay()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.changeTimer)
  }

  setupCarousel() {
    const { children } = this.props
    const { currentPosition } = this.state

    const itemWidth = this.sliderNode.getBoundingClientRect().width
    const currentIndex = Math.min(
      currentPosition ? Math.abs(Math.ceil(currentPosition)) : 0,
      children.length - 1
    )

    this.setState(
      {
        currentPosition: currentIndex,
        initialized: true,
        carouselItems: children,
        clones: this.cloneItems(children),
        translate3d: -itemWidth * (1 + currentIndex),
        itemWidth,
      },
      () => this.props.initializedCarousel(true)
    )
  }

  cloneItems = children => {
    const firstChild = children.slice(0, 1)
    const lastChild = children.slice(children.length - 1)

    return [...lastChild, ...children, ...firstChild]
  }

  setupCarouselItems() {
    const items = this.props.children
    this.setState({
      lastPosition: items.length,
      carouselItems: items,
      fromChildren: true,
    })
  }

  setupAutoPlay() {
    this.autoPlay()
    const carouselWrapper = this.carouselWrapper

    if (this.props.stopOnHover && carouselWrapper) {
      // Stop mobile propagation
      // Required so touch/tap events don't cause mouseEnter/mouseLeave to fire
      const mobileTouch = (function isTouch() {
        try {
          document.createEvent('TouchEvent')
          return true
        } catch (e) {
          return false
        }
      })()

      if (!mobileTouch) {
        carouselWrapper.addEventListener(
          'mouseenter',
          ev => {
            this.stopOnHover()
          },
          false
        )

        carouselWrapper.addEventListener('mouseleave', ev => {
          this.startOnHoverLeave()
        })
      }
    }
  }

  autoPlay() {
    this.autoPlayTimer = setTimeout(() => {
      this.increment()
    }, this.props.intervalDuration)
  }

  clearAutoPlay() {
    clearTimeout(this.autoPlayTimer)
    clearTimeout(this.calcCheckTimer)
    clearTimeout(this.changeTimer)
  }

  resetAutoPlay() {
    this.clearAutoPlay()
    this.autoPlay()
  }

  stopOnHover() {
    this.setState({
      isMouseEntered: true,
    })
    this.props.onCarouselMouseEnter(
      Date.now(),
      this.state.carouselItems[this.state.currentPosition].itemId
    )
    if (this.props.autoPlay) {
      this.clearAutoPlay()
    }
  }

  startOnHoverLeave() {
    this.setState({
      isMouseEntered: false,
    })
    this.props.onCarouselMouseLeave(
      Date.now(),
      this.state.carouselItems[this.state.currentPosition].itemId
    )
    if (this.props.autoPlay) {
      this.autoPlay()
    }
  }

  decrement = () => {
    this.moveTo(this.state.currentPosition - 1)
  }

  increment = () => {
    this.moveTo(this.state.currentPosition + 1)
  }

  moveTo = index => {
    const { itemWidth, isMouseEntered, carouselItems, disabled } = this.state

    const translate = (index + 1) * itemWidth

    this.setState(
      {
        disabled: true,
        currentPosition: index,
        translate3d: -translate,
        cssAnimation: {
          transition: `transform ${this.props.transitionDuration}ms ${
            this.props.cssEase
          }`,
        },
      },
      this.recalculateChecker
    )

    // don't reset auto play when stop on hover is enabled, doing so will trigger a call to auto play more than once
    // and will result in the interval function not being cleared correctly.
    if (this.props.autoPlay && !isMouseEntered) {
      this.resetAutoPlay()
    }
  }

  recalculateChecker = () => {
    const { currentPosition, carouselItems } = this.state
    const recalc =
      currentPosition < 0 || currentPosition >= carouselItems.length

    window.clearTimeout()
    window.setTimeout(() => {
      recalc ? this.calculateSliderPos() : this.onSlideChange()
    }, this.props.transitionDuration)
  }

  calculateSliderPos() {
    const { currentPosition, carouselItems, itemWidth } = this.state

    let newPos = currentPosition < 0 ? carouselItems.length - 1 : 0

    this.setState(
      {
        currentPosition: newPos,
        translate3d: -itemWidth * (newPos === 0 ? 1 : carouselItems.length),
        disabled: false,
        cssAnimation: {
          transition: `transform 0ms ${this.props.cssEase}`,
        },
      },
      this.onSlideChange
    )
  }

  onSlideChange = () => {
    this.props.onCarouselChange(this.state.selectedItem)
    this.setState({ ...this.state, disabled: false })
  }

  setSliderStyles() {
    const currentPosition = `${-this.state.currentPosition * 100}%`
    let animationObject = {}

    if (this.props.animationType === 'slide') {
      animationObject = {
        transform: `translate3d(${currentPosition}, 0, 0)`,
        transition: `${this.props.transitionDuration}ms ${this.props.cssEase}`,
      }

      this.setState(
        {
          cssAnimation: animationObject,
        },
        () => this.props.onCarouselChange(this.state.currentPosition)
      )

      if (this.state.currentPosition === this.state.lastPosition) {
        // Reset the current slide position back to 0% with no transition
        clearTimeout(this.endTimer)
        this.endTimer = setTimeout(() => {
          this.setState({
            cssAnimation: {
              transform: 'translate3d(0px, 0, 0)',
              transition: 'none',
            },
          })
        }, this.props.transitionDuration)
      }
    } else if (this.props.animationType === 'fade') {
      this.changeTimer = setTimeout(() => {
        this.props.onCarouselChange(this.state.currentPosition)
      }, this.props.transitionDuration)
    } else {
      console.error(
        `You used the animation value ${
          this.props.animationType
        } which is not currently supported by the carousel. Please use one of 'slide' or 'fade'.`
      )
    }
  }

  itemStyles(index) {
    const { itemWidth, currentPosition } = this.state
    let style = {
      width: `${itemWidth}px`,
    }

    if (this.props.animationType === 'fade') {
      style = {
        left: `${-index * itemWidth}px`,
        opacity: 0,
        zIndex: -1,
        transition: `opacity ${this.props.transitionDuration}ms ${
          this.props.cssEase
        }`,
      }

      if (currentPosition === index) {
        style = Object.assign({}, style, {
          opacity: 1,
          zIndex: 1,
        })
      }
    }

    return style
  }

  changeItem = e => {
    const { value } = e.target
    this.moveTo(value)
  }

  renderCarouselItems = (item, index) => {
    const { carouselItems } = this.state

    const cloned = index < 1 || index > carouselItems.length + 1 - 1

    const className = [
      styles['carousel-item'],
      cloned && this.props.infinite === false
        ? styles['carousel-item--cloned']
        : '',
    ].join(' ')

    return (
      <li
        key={`item-${index}`}
        className={className}
        id={`item-${index}`}
        ref={el => (this[`item${index}`] = el)}
        style={this.itemStyles(index)}
        onClick={() => this.props.onCarouselItemClick(index)}
        onKeyPress={e => {
          console.log(e)
        }}
      >
        {item}
      </li>
    )
  }

  getActiveDotIndex() {
    const { carouselItems, currentPosition } = this.state

    const currentIndex = currentPosition + 1
    const itemLength = carouselItems.length

    if (currentIndex < 1) {
      return itemLength - 1
    } else if (currentIndex > itemLength) {
      return 0
    } else {
      return currentIndex - 1
    }
  }

  onIndicatorMouseEnter = e => {
    const { value } = e.target
    this.setState({
      selectedIndicator: value,
    })
  }

  onIndicatorMouseLeave = e => {
    this.setState({ selectedIndicator: null })
  }

  renderIndicators() {
    const { carouselItems } = this.state

    if (!this.props.showIndicators) {
      return null
    }

    return (
      <ul
        className={styles['control-dots']}
        style={this.props.indicatorUlStyles}
      >
        {carouselItems.map((item, index) => {
          const liClassName =
            this.getActiveDotIndex() !== index
              ? styles.dot
              : [styles.dot, styles['dot-selected']].join(' ')

          const style =
            this.state.selectedIndicator === index
              ? {
                  opacity: 1,
                  transform: 'scale(1.2) translateZ(0)',
                  backfaceVisibility: 'hidden',
                  mixBlendMode: 'normal',
                }
              : {}

          return (
            <li
              className={liClassName}
              onClick={this.changeItem}
              onMouseEnter={this.onIndicatorMouseEnter}
              onMouseLeave={this.onIndicatorMouseLeave}
              value={index}
              key={index}
              style={Object.assign({}, style, this.props.indicatorLiStyles)}
            />
          )
        })}
      </ul>
    )
  }

  onArrowMouseEnter = (e, action) => {
    const key = `${action}ArrowHover`
    this.setState({
      [key]: true,
    })
  }

  onArrowMouseLeave = (e, action) => {
    const key = `${action}ArrowHover`
    this.setState({
      [key]: false,
    })
  }

  renderArrows = action => {
    const isPrev = action === 'previous'
    const isHover = this.state[`${action}ArrowHover`]

    const gradientDirection = isPrev ? 'to right' : 'to left'

    const style = {
      button: {
        background: `linear-gradient(
               ${gradientDirection},
               rgba(0, 0, 0, 0.2),
               rgba(0, 0, 0, 0)
            )`,
      },
      icon: {
        transition: 'transform 0.3s ease',
        opacity: isHover ? 1 : 0.4,
        transform: isHover
          ? 'scale(1.2) translateZ(0)'
          : 'scale(1) translateZ(0)',
        backfaceVisibility: 'hidden',
        mixBlendMode: 'normal',
      },
    }

    return (
      <button
        type="button"
        className={[styles['arrow'], styles[`arrow--${action}`]].join(' ')}
        onClick={isPrev ? this.decrement : this.increment}
        style={style.button}
        disabled={this.state.disabled}
        onMouseEnter={e => this.onArrowMouseEnter(e, action)}
        onMouseLeave={e => this.onArrowMouseLeave(e, action)}
      >
        <img
          height={'44px'}
          width={'44px'}
          style={style.icon}
          src={action === 'previous' ? leftChevron : rightChevron}
          alt={`${action} arrow`}
        />
      </button>
    )
  }

  render() {
    const { showArrows, showIndicators, height } = this.props
    const { carouselItems, cssAnimation, clones, translate3d } = this.state

    const items = clones || carouselItems

    let sliderStyle
    if (this.props.animationType === 'fade') {
      sliderStyle = {
        transform: 'translate3d(0px, 0, 0)',
      }
    } else {
      sliderStyle = {
        ...cssAnimation,
        transform: `translate3d(${translate3d}px, 0, 0)`,
      }
    }

    return (
      <div
        className={styles['glomo-carousel']}
        ref={el => (this.carouselWrapper = el)}
        style={{ height }}
      >
        <div className={styles['carousel-wrapper']} style={{ height }}>
          <div className={styles['slider-wrapper']}>
            <ul
              className={styles.slider}
              style={{
                ...sliderStyle,
                height: '100%',
              }}
              ref={node => (this.sliderNode = node)}
            >
              {/* Render Carousel Items */}
              {items.map(this.renderCarouselItems)}
            </ul>
          </div>
        </div>
        {showArrows && this.renderArrows('previous')}
        {showArrows && this.renderArrows('next')}
        {showIndicators && this.renderIndicators()}
      </div>
    )
  }
}
