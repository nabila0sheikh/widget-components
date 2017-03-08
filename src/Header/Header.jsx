import React, { Component } from 'react';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import styles from './Header.scss';

/**
 * Header component, used to create standard headers, this component changes its default behavior based on coreLibrary.pageInfo.
 * If pageInfo.pageType is "home" the header is white background with grey text, otherwise the widget becomes collapsable and the header becomes black with white text.
 * These defaults are overridable by the props
 * @memberof widget-components
 */
class Header extends Component {

   /*
    * Constructs.
    * @param {object} props Header properties
    */
   constructor ( props ) {
      super(props);
      this.state = {
         hidden: this.props.hidden,
         isHome: coreLibrary.pageInfo.pageType === 'home'
      };
      this.toggleHeader = this.toggleHeader.bind(this);
   }

   /*
    * Called after mounting component
    */
   componentDidMount () {
      if ( this.state.hidden ) {
         // Collapse widget if needed by initial state
         widgetModule.setWidgetHeight(this.headerHeight);
      }
   }

   get headerHeight() {
      if (this.headerElement) {
         return this.headerElement.offsetHeight;
      } else if (this.props.collapsable) {
         return 40;
      }
      return 37;
   }

   /*
    * Collapses or expands the widget
    */
   toggleHeader () {
      if ( this.props.collapsable === true ||
         (
            this.props.collapsable == null &&
            !this.state.isHome
         )) {
         this.setState({ hidden: !this.state.hidden });
         if ( !this.state.hidden ) {
            widgetModule.setWidgetHeight(this.headerHeight);
            if (this.props.onCollapse) {
               this.props.onCollapse();
            }
         } else {
            widgetModule.adaptWidgetHeight();
            if (this.props.onExpand) {
               this.props.onExpand();
            }
         }
      }
   }

   /*
    * Creates Header template.
    * @returns {XML}
    */
   render () {
      // Default classes to be added to all headers
      let cssClasses = 'l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color KambiWidget-card-header-border';
      // If we have custom classes disregard default styling and load custom classes
      if ( typeof this.props.customClasses === 'string') {
         cssClasses = this.props.customClasses;
      } else {
         // Add classes depending on pageInfo
         if (this.state.isHome) { // eslint-disable-line
            cssClasses += ' l-pt-6 l-pb-6 ';
         } else {
            cssClasses += ' KambiWidget-header l-pt-8 l-pb-8 ' + styles.kwNotHome;
         }
      }

      return (
         <header
            ref={(headerElement) => { this.headerElement = headerElement }}
            className={cssClasses}
            onClick={this.toggleHeader}>
            {this.props.children}
         </header>
      )
   }
}

/**
 * @property children {ReactElement} Elements to be placed inside the header
 * @property [collapsable] {boolean} Sets header as collapsable. If not provided will be collapsable if coreLibrary.pageInfo.pageType !== 'home'
 * @property [hidden] {boolean} if true the widget will start collapsed
 * @property [onCollapse] {Function} callback invoked when the widget collapses
 * @property [onExpand] {Function} callback invoked when the widget uncollapses
 * @property [customClasses] {string} Defaults to false. If provided adds these CSS classes to the header instead of adding classes based on coreLibrary.pageInfo.pageType (black header if pageType !== 'home')
 */
Header.propTypes = {
   children: React.PropTypes.node.isRequired,
   collapsable: React.PropTypes.bool,
   hidden: React.PropTypes.bool,
   onCollapse: React.PropTypes.func,
   onExpand: React.PropTypes.func,
   customClasses: React.PropTypes.string
};

export default Header;
