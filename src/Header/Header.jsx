import React, { Component } from 'react';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import styles from './Header.scss';

class Header extends Component {

   /**
    * Constructs.
    * @param {object} props Header properties
    */
   constructor ( props ) {
      super(props);
      this.state = {
         hidden: this.props.hidden
      };
      this.toggleHeader = this.toggleHeader.bind(this);
   }

   /**
    * Called after mounting component
    */
   componentDidMount () {
      if ( this.state.hidden ) {
         // Collapse widget if needed by initial state
         widgetModule.setWidgetHeight(Header.HEIGHT);
      }
   }

   /**
    * Collapses or expands the widget
    * @returns {function|null} A callback baes on the action performed or null if no call back was provided
    */
   toggleHeader () {
      this.setState({ hidden: !this.state.hidden });
      if ( this.props.collapsable ) {
         if ( !this.state.hidden ) {
            widgetModule.setWidgetHeight(Header.HEIGHT);
            return ( this.props.onCollapse ) ? this.props.onCollapse() : null;
         }
         widgetModule.adaptWidgetHeight();
         return ( this.props.onExpand ) ? this.props.onExpand() : null;
      }
   }

   /**
    * Creates Header template.
    * @returns {XML}
    */
   render () {
      // Default classes to be added to all headers
      let cssClasses = 'l-flexbox l-pl-16 l-pr-16 KambiWidget-card-support-text-color';
      // If we have custom classes disregard default styling and load custom classes
      if ( this.props.className ) {
         cssClasses = this.props.className;
      } else {
         // Add classes depending on pageInfo
         cssClasses += (coreLibrary.pageInfo.pageType === 'home') ? ' l-pt-6 l-pb-6 ' + styles.kwHeader : ' KambiWidget-header l-pt-8 l-pb-8';
      }

      return (
         <header
            className={cssClasses}
            onClick={this.toggleHeader}>
            {this.props.children}
         </header>
      )
   }
}

Header.propTypes = {

   /**
    * Elements passed from parent
    */
   children: React.PropTypes.node.isRequired,

   /**
    * Sets header as collapsable
    */
   collapsable: React.PropTypes.bool,


   /**
    * Sets initial state
    */
   hidden: React.PropTypes.bool,

   /**
    * Callback after collapse
    */
   onCollapse: React.PropTypes.func,

   /**
    * Callback after expand
    */
   onExpand: React.PropTypes.func,

   /**
    * Custom styling.
    */
   className: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.bool])
};

Header.defaultProps = {
   className: false
};

/**
 * Holds the height of the header in pixels
 * @type {number}
 */
Header.HEIGHT = (coreLibrary.pageInfo.pageType === 'home') ? 37 : 40;

export default Header;
