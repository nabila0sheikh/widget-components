/* eslint-disable camelcase */

import React, { Children, Component } from 'react'
import PropTypes from 'prop-types'
import styles from './ScrolledList.scss'
import ArrowButton from './ArrowButton'
import ItemContainer from '../ItemContainer'

/*
 * Window resize handling reflex (in milliseconds)
 * @type {number}
 */
const UPDATE_MOMENTUM = 150

/*
 * Duration of bar element scrollLeft animation (in milliseconds)
 * @type {number}
 */
const BAR_TRANSITION_DURATION = 300

/**
 * Items alignment constants
 * @enum {string}
 * @readonly
 * @example
 * <ScrolledList alignItems={ScrolledList.ALIGN_ITEMS.SPACE_BETWEEN}>...</ScrolledList>
 */
const ScrolledList_ALIGN_ITEMS = {
  /**
   * List items will be aligned to the left.
   * @member {string}
   */
  LEFT: 'flex-start',

  /**
   * List items will be aligned to the right.
   * @member {string}
   */
  RIGHT: 'flex-end',

  /**
   * List items will be centered.
   * @member {string}
   */
  CENTER: 'center',

  /**
   * There will be space around all items.
   * @member {string}
   */
  SPACE_AROUND: 'space-around',

  /**
   * There will be space only between items.
   * @member {string}
   */
  SPACE_BETWEEN: 'space-between',
}

/**
 * Scroll to selected item modes
 * @enum {string}
 * @readonly
 * @example
 * <ScrolledList scrollToItemMode={ScrolledList.SCROLL_TO_ITEM_MODE.TO_LEFT}>...</ScrolledList>
 */
const ScrolledList_SCROLL_TO_ITEM_MODE = {
  /**
   * Selected item will be the first object on the left side of eye shot
   */
  TO_LEFT: 'to-left',

  /**
   * Selected item will be at the center of eye shot
   */
  CENTER: 'center',
}

/*
 * Determines if component is running on touch screen device.
 * @returns {boolean}
 */
const isTouchScreen = () => 'ontouchstart' in window

/*
 * Performs animation on given element's property.
 * @param {HTMLElement} element Element to animate
 * @param {string} property Element's property to animate
 * @param {number} value Target property value
 * @param {number} duration Animation duration
 */
const animate = function(element, property, value, duration) {
  let requestAnimationFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    (callback => {
      const now = Date.now()

      // further calls will be invoked with future timestamp
      requestAnimationFrame = callback => callback(now + duration)

      // first call will run step function immediately
      callback(now)
    })

  let start = null

  const initial = element[property],
    delta = value - initial

  return new Promise(resolve => {
    const step = function(timestamp) {
      if (!start) {
        start = timestamp
      }

      let progress = (timestamp - start) / duration

      if (progress > 1) {
        progress = 1
      }

      // easeOutQuad
      element[property] = -delta * progress * (progress - 2) + initial

      // animation finished
      if (progress >= 1) {
        resolve()
        return
      }

      requestAnimationFrame(step)
    }

    requestAnimationFrame(step)
  })
}

/**
 * Horizontal scrolled list component.
 * If items won't fit the container the list will be scrolled. Otherwise if items take less space
 * than the container they will be aligned according to [alignItems]{@link widget-components.ScrolledList.propTypes} property.
 * @memberOf widget-components
 */
class ScrolledList extends Component {
  /*
    * Constructs.
    * @param {object} props Component properties
    */
  constructor(props) {
    super(props)

    this.state = {
      item: props.selected,
    }

    this.itemWidths = []

    this.prevPage = this.prevPage.bind(this)
    this.nextPage = this.nextPage.bind(this)
    this.enqueueUpdate = this.enqueueUpdate.bind(this)
  }

  /*
    * Called after component rendering to DOM.
    */
  componentDidMount() {
    window.addEventListener('resize', this.enqueueUpdate)
    this.scrollToItem(this.state.item)
    this.updateItemsAlignment()
  }

  /*
       * Called on external props change.
       */
  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.scrollToItem(this.props.selected)
    }
  }

  /*
    * Called before removing component.
    */
  componentWillUnmount() {
    window.removeEventListener('resize', this.enqueueUpdate)
  }

  /*
    * Selects item with given index.
    * @param {number} idx Item index
    */
  onItemClick(idx) {
    if (this.props.onItemClick) {
      this.props.onItemClick(idx)
    }

    this.setState({ item: idx })
  }

  /*
    * Updates internal state with item's width and re-renders view if necessary.
    * @param {number} idx Item index
    * @param {number?} width Desired item width
    */
  setItemWidth(idx, width) {
    if (typeof width !== 'number') {
      return
    }

    if (this.itemWidths[idx] !== width) {
      this.itemWidths[idx] = width
      this.enqueueUpdate()
    }
  }

  /*
    * Throttles widget rendering updates.
    */
  enqueueUpdate() {
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout)
    }

    this.updateTimeout = setTimeout(() => {
      this.updateItemsAlignment()
      this.scrollToItem(this.state.item)
      this.forceUpdate()
    }, UPDATE_MOMENTUM)
  }

  /*
    * Current scroll left offset (in pixels).
    */
  get currentScrollLeft() {
    return this.eyeshot ? this.eyeshot.scrollLeft : 0
  }

  /*
    * Field of view width.
    * @returns {number|null}
    */
  get eyeshotWidth() {
    return this.eyeshot ? this.eyeshot.offsetWidth : null
  }

  /*
    * Returns maximal scroll left offset.
    * @returns {number|null}
    */
  get maxScrollLeft() {
    if (!this.eyeshotWidth) {
      return null
    }

    return (
      this.computeItemsWidth(0, Children.count(this.props.children) - 1) -
      this.eyeshotWidth
    )
  }

  /*
    * Updates items alignment if they take less space than container width.
    */
  updateItemsAlignment() {
    if (!this.bar) {
      return
    }

    const itemsWidth = this.computeItemsWidth(
      0,
      Children.count(this.props.children) - 1
    )

    if (itemsWidth < this.eyeshotWidth) {
      this.bar.style.justifyContent = this.props.alignItems
    } else {
      this.bar.style.justifyContent = ''
    }
  }

  /*
    * Scrolls list to given offset.
    * @param {number} offset Scroll offset
    */
  scrollTo(offset) {
    if (!(this.maxScrollLeft && this.eyeshot)) {
      return
    }

    offset = Math.round(offset)

    let scrollLeft = offset > this.maxScrollLeft ? this.maxScrollLeft : offset
    scrollLeft = scrollLeft < 0 ? 0 : scrollLeft

    if (scrollLeft == this.currentScrollLeft) {
      return
    }

    animate(
      this.eyeshot,
      'scrollLeft',
      scrollLeft,
      BAR_TRANSITION_DURATION
    ).then(() => this.forceUpdate())
  }

  /*
    * Scrolls bar to given item.
    * @param {number} item Item index
    *
    * Example for item=2
    *
    * computeItemsWidth(0, item - 1)
    * <--------------------------->
    *
    *                           computeItemsWidth(item)
    *                             <----------------->
    *
    *                         /=========================\
    * /-----------------------#-------------------------#-------------------------------\
    * |         |             #   |                 |   #             |                 |
    * |    0    |        1    #   |        2        |   #    3        |        4        |
    * |         |             #   |                 |   #             |                 |
    * \-----------------------#-------------------------#-------------------------------/
    *                         \=========================/
    *
    *                         <------ eyeshotWidth ----->
    */
  scrollToItem(item) {
    switch (this.props.scrollToItemMode) {
      case ScrolledList_SCROLL_TO_ITEM_MODE.TO_LEFT:
        this.scrollTo(item ? this.computeItemsWidth(0, item - 1) : 0)
        break

      case ScrolledList_SCROLL_TO_ITEM_MODE.CENTER:
      default:
        this.scrollTo(
          (item ? this.computeItemsWidth(0, item - 1) : 0) -
            (this.eyeshotWidth - this.computeItemsWidth(item)) / 2
        )
    }
  }

  /*
    * Should prev button be shown
    * @returns {boolean}
    */
  get showPrevButton() {
    return this.currentScrollLeft > 0
  }

  /*
    * Should next button be shown
    * @returns {boolean}
    */
  get showNextButton() {
    return this.currentScrollLeft < this.maxScrollLeft
  }

  /*
    * Returns item widths sum for given range.
    * @param {number} start First item index
    * @param {number} end Last item index
    * @returns {number}
    */
  computeItemsWidth(start, end = start) {
    return this.itemWidths
      .slice(start, end + 1)
      .reduce((sum, itemWidth) => sum + (itemWidth ? itemWidth : 0), 0)
  }

  /*
    * Computes average item width across all items.
    * @returns {number}
    */
  get averageItemWidth() {
    return (
      this.computeItemsWidth(0, Children.count(this.props.children) - 1) /
      Children.count(this.props.children)
    )
  }

  /*
    * Scrolls list to previous page.
    */
  prevPage() {
    this.scrollTo(
      this.currentScrollLeft - this.props.step * this.averageItemWidth
    )
  }

  /*
    * Scrolls list to next page.
    */
  nextPage() {
    this.scrollTo(
      this.currentScrollLeft + this.props.step * this.averageItemWidth
    )
  }

  /*
    * Renders scrolled item list.
    * @returns {XML}
    */
  render() {
    const className = [
      styles.container,
      this.props.showControls ? '' : styles['no-controls'],
      isTouchScreen() ? styles.touch : '',
    ]
      .join(' ')
      .trim()

    let scrolledListHasHorizontalSpaceLeft = false
    const itemsWidth = this.computeItemsWidth(
      0,
      Children.count(this.props.children) - 1
    )
    if (itemsWidth < this.eyeshotWidth) {
      scrolledListHasHorizontalSpaceLeft = true
    }

    return (
      <div
        className={className}
        style={{ opacity: itemsWidth === 0 ? 0 : 1 }}
        ref={el => (this.container = el)}
      >
        <div className={styles.eyeshot} ref={el => (this.eyeshot = el)}>
          <div className={styles.bar} ref={el => (this.bar = el)}>
            {Children.map(this.props.children, (child, i) => {
              if (scrolledListHasHorizontalSpaceLeft) {
                child = React.cloneElement(child, {
                  scrolledListHasHorizontalSpaceLeft,
                })
              }
              return this.props.renderItemContainer({
                key: i,
                selected: this.state.item == i,
                onClick: this.onItemClick.bind(this, i),
                onWidth: this.setItemWidth.bind(this, i),
                children: child,
              })
            })}
          </div>
        </div>
        {this.props.showControls &&
          this.props.renderPrevButton({
            onClick: this.prevPage,
            disabled: !this.showPrevButton,
          })}
        {this.props.showControls &&
          this.props.renderNextButton({
            onClick: this.nextPage,
            disabled: !this.showNextButton,
          })}
      </div>
    )
  }
}

ScrolledList.ALIGN_ITEMS = ScrolledList_ALIGN_ITEMS
ScrolledList.SCROLL_TO_ITEM_MODE = ScrolledList_SCROLL_TO_ITEM_MODE

/**
 * Should return rendered prev/next scroll button.
 * @callback ScrolledList_RenderButton
 * @param {ScrolledList_RenderButtonArgs} args Contains properties which will control the button
 * @returns ReactElement
 *
 * @example <caption>Using custom button for next/prev.</caption>
 *    ({onClick, disabled}) => <CustomButton onClick={onClick} disabled={disabled} />
 *
 * @example <caption>Shorthand syntax can be used once function arguments and component properties names match.</caption>
 *    args => <CustomButton {...args} />
 */

/**
 * @name ScrolledList_RenderButtonArgs
 * @property {function} onClick Click handler
 * @property {boolean} disabled Controls whether button should be rendered as disabled or not
 */

/**
 * Should return rendered item container.
 * Container is responsible for receiving clicks, properly rendering selected state and optionally hover.
 * @callback ScrolledList_RenderItemContainer
 * @param {ScrolledList_RenderItemContainerArgs} args Container properties which will control the container
 * @returns ReactElement
 *
 * @example <caption>Using custom item container</caption>
 *    ({selected, onClick, onWidth, children}) =>
 *       <CustomItemContainer
 *          selected={selected}
 *          onClick={onClick}
 *          onWidth={onWidth}>
 *             {children}
 *       </CustomItemContainer>
 *
 * @example <caption>Shorthand syntax can be used once function arguments and component properties names match.</caption>
 *    args => <CustomItemContainer {...args}>{args.children}</CustomItemContainer>
 */

/**
 * @name ScrolledList_RenderItemContainerArgs
 * @property {boolean} selected Controls whether item should be rendered as currently selected or normally
 * @property {function} onClick Called once item has been clicked
 * @property {function} onWidth Called when item width is determined or has been changed
 * @property {ReactElement} children Item contents
 */

/**
 * @property [children] {ReactElement[]} Items list
 * @property [onItemClick] {function(number)} Item click handler. Called with item index argument.
 * @property [selected=0] {number} Initially selected item index
 * @property [step=2] {number} Scroll step (items count)
 * @property [alignItems=CENTER] {ScrolledList_ALIGN_ITEMS} Method of aligning items when they take less width than the container has
 * @property [renderPrevButton] {ScrolledList_RenderButton} Function capable of rendering button responsible for scrolling left. Renders left arrow button by default.
 * @property [renderNextButton] {ScrolledList_RenderButton} Function capable of rendering button responsible for scrolling right. Renders right arrow button by default.
 * @property [renderItemContainer] {ScrolledList_RenderItemContainer} Function capable of rendering item container. Renders Kambi-styled item container by default.
 * @property [scrollToItemMode=CENTER] {ScrolledList_SCROLL_TO_ITEM_MODE} Scroll to selected item mode
 * @property [showControls] {boolean} Decides whether next/prev controls be visible e.g. can be hidden in mobile mode
 */
ScrolledList.propTypes = {
  children: PropTypes.node,
  onItemClick: PropTypes.func,
  selected: PropTypes.number,
  step: PropTypes.number,
  alignItems: PropTypes.oneOf(
    Object.keys(ScrolledList_ALIGN_ITEMS).map(k => ScrolledList_ALIGN_ITEMS[k])
  ),
  renderPrevButton: PropTypes.func,
  renderNextButton: PropTypes.func,
  renderItemContainer: PropTypes.func,
  scrollToItemMode: PropTypes.oneOf(
    Object.keys(ScrolledList_SCROLL_TO_ITEM_MODE).map(
      k => ScrolledList_SCROLL_TO_ITEM_MODE[k]
    )
  ),
  showControls: PropTypes.bool,
}

ScrolledList.defaultProps = {
  selected: 0,
  step: 2,
  alignItems: ScrolledList_ALIGN_ITEMS.CENTER,
  scrollToItemMode: ScrolledList_SCROLL_TO_ITEM_MODE.CENTER,
  renderPrevButton: props => <ArrowButton type="left" {...props} />,
  renderNextButton: props => <ArrowButton type="right" {...props} />,
  renderItemContainer: args => (
    <ItemContainer {...args}>{args.children}</ItemContainer>
  ),
  showControls: true,
}

export default ScrolledList
