import React, { Children, Component, PropTypes } from 'react';
import styles from './TabBarScrolled.scss';
import ArrowButton from './ArrowButton';
import TabContainer from './TabContainer';

/**
 * Window resize handling reflex
 * @type {number}
 */
const RESIZE_SLUGGISHNESS = 200;

/**
 * Will turn off mobile mode if screen is wider than defined below
 * @type {number}
 */
const MOBILE_MAX_SCREEN_WIDTH = 768;

/**
 * Mobile browser check
 * @type {boolean}
 */
const isMobileBrowser = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

/**
 * Scrolled Tab Bar component
 */
class TabBarScrolled extends Component {

   /**
    * Constructs.
    * @param {object} props Component properties
    */
   constructor(props) {
      super(props);

      this.state = {
         tab: props.selected
      };

      this.scrollLeft = 0;
      this.tabWidths = [];

      this.prevPage = this.prevPage.bind(this);
      this.nextPage = this.nextPage.bind(this);
      this.onResize = this.onResize.bind(this);
   }

   /**
    * Called after component rendering to DOM.
    */
   componentDidMount() {
      window.addEventListener('resize', this.onResize);
      this.scrollToTab(this.state.tab);
   }

   /**
    * Called before removing component.
    */
   componentWillUnmount() {
      window.removeEventListener('resize', this.onResize);
   }

   /**
    * Handles window resize
    */
   onResize() {
      if (this.resizeTimeout) {
         clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
         this.scrollToTab(this.state.tab);
      }, RESIZE_SLUGGISHNESS);
   }

   /**
    * Selects tab with given index.
    * @param {number} idx Tab index
    */
   onTabClick(idx) {
      if (this.props.onTabSwitch) {
         this.props.onTabSwitch(idx);
      }

      this.scrollToTab(idx);

      this.setState({ tab: idx });
   }

   /**
    * Determines if component is running on mobile device.
    * @returns {boolean}
    */
   get mobileMode() {
      const hasTouchStart = 'ontouchstart' in window;

      if (!this.containerWidth) {
         return hasTouchStart && isMobileBrowser;
      }

      return this.containerWidth <= MOBILE_MAX_SCREEN_WIDTH && hasTouchStart && isMobileBrowser;
   }

   /**
    * Whole component's width.
    * @returns {number}
    */
   get containerWidth() {
      return this.container ? this.container.offsetWidth : null;
   }

   /**
    * Field of view width.
    * @returns {number|null}
    */
   get eyeshotWidth() {
      return this.eyeshot ? this.eyeshot.offsetWidth : null;
   }

   /**
    * Returns maximal scroll left offset.
    * @returns {number|null}
    */
   get maxScrollLeft() {
      if (!(this.eyeshotWidth)) {
         return null;
      }

      return this.computeTabsWidth(0, Children.count(this.props.children) - 1) - this.eyeshotWidth;
   }

   /**
    * Scrolls bar to given offset.
    * @param {number} offset Scroll offset
    */
   scrollTo(offset) {
      if (!(this.bar && this.maxScrollLeft && this.eyeshotWidth && this.eyeshot)) {
         return;
      }

      this.scrollLeft = offset > this.maxScrollLeft ? this.maxScrollLeft : offset;
      this.scrollLeft = this.scrollLeft < 0 ? 0 : this.scrollLeft;

      if (this.mobileMode) {
         this.eyeshot.scrollLeft = this.scrollLeft;
         this.translateX = 0;
      } else {
         this.translateX = -1 * this.scrollLeft;
         this.eyeshot.scrollLeft = 0;
      }

      this.forceUpdate();
   }

   /**
    * Translates bar element by given offset.
    * @param {number} offsetX X axis offset
    */
   set translateX(offsetX) {
      const transform = `translate3d(${offsetX}px, 0, 0)`;
      this.bar.style.transform = transform;
      this.bar.style.webkitTransform = transform;
      this.bar.style.mozTransform = transform;
   }

   /**
    * Scrolls bar to given tab.
    * @param {number} tab Tab index
    */
   scrollToTab(tab) {
      if (!(this.bar && this.eyeshotWidth)) {
         return;
      }

      this.scrollTo(this.computeTabsWidth(0, tab) - (this.eyeshotWidth - this.computeTabsWidth(tab)) / 2);
   }

   /**
    * Should prev button be shown
    * @returns {boolean}
    */
   get showPrevButton() {
      return !this.mobileMode && this.scrollLeft > 0;
   }

   /**
    * Should next button be shown
    * @returns {boolean}
    */
   get showNextButton() {
      return !this.mobileMode && this.scrollLeft < this.maxScrollLeft;
   }

   /**
    * Returns tab widths sum for given range.
    * @param {number} start First tab index
    * @param {number} end Last tab index
    * @returns {number}
    */
   computeTabsWidth(start, end = start) {
      return this.tabWidths
         .slice(start, end + 1)
         .reduce((sum, tabWidth) => sum + (tabWidth ? tabWidth : 0), 0);
   }

   get averageTabWidth() {
      return this.computeTabsWidth(0, Children.count(this.props.children) - 1) / Children.count(this.props.children);
   }

   /**
    * Scrolls tab bar to previous page.
    */
   prevPage() {
      this.scrollTo(this.scrollLeft - this.props.step * this.averageTabWidth);
   }

   /**
    * Scrolls tab bar to next page.
    */
   nextPage() {
      this.scrollTo(this.scrollLeft + this.props.step * this.averageTabWidth);
   }

   /**
    * Updates given tab's width if necessary.
    * @param {number} idx Tab index
    * @param {number?} width Desired tab width
    */
   setTabWidth(idx, width) {
      if (typeof width !== 'number') {
         return;
      }

      if (this.tabWidths[idx] !== width) {
         this.tabWidths[idx] = width;
         this.forceUpdate();
      }
   }

   /**
    * Renders scrolled tab bar.
    * @returns {XML}
    */
   render() {
      return (
         <div className={styles.container} ref={el => (this.container = el)}>
            <div className={styles.eyeshot} ref={el => (this.eyeshot = el)}>
               <div className={styles.bar} ref={el => (this.bar = el)}>
                  {Children.map(this.props.children, (child, i) => this.props.renderTabContainer({
                     key: i,
                     selected: this.state.tab == i,
                     onClick: this.onTabClick.bind(this, i),
                     onWidth: this.setTabWidth.bind(this, i),
                     children: child
                  }))}
               </div>
            </div>
            {this.props.renderPrevButton({
               onClick: this.prevPage,
               disabled: !this.showPrevButton
            })}
            {this.props.renderNextButton({
               onClick: this.nextPage,
               disabled: !this.showNextButton
            })}
         </div>
      );
   }
}

TabBarScrolled.propTypes = {
   /**
    * Tab element
    */
   children: PropTypes.node,

   /**
    * Tab clicked handler
    */
   onTabSwitch: PropTypes.func,

   /**
    * Selected tab index
    */
   selected: PropTypes.number,

   /**
    * Scroll step (items count)
    */
   step: PropTypes.number,

   /**
    * Function capable of rendering button responsible for scrolling left
    */
   renderPrevButton: PropTypes.func,

   /**
    * Function capable of rendering button responsible for scrolling right
    */
   renderNextButton: PropTypes.func,

   /**
    * Function capable of rendering tab container
    */
   renderTabContainer: PropTypes.func
};

TabBarScrolled.defaultProps = {
   selected: 0,
   step: 2,
   renderPrevButton: props => <ArrowButton type='left' {...props} />,
   renderNextButton: props => <ArrowButton type='right' {...props} />,
   renderTabContainer: args => <TabContainer {...args}>{args.children}</TabContainer>
};

export default TabBarScrolled;
