import React, { Component } from 'react';
import { coreLibrary, widgetModule } from 'kambi-widget-core-library';
import styles from './IconHeader.scss';

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
   render({iconCSSClasses, iconPath, title, subtitle}) {
      return (<header className='KambiWidget-card-border-color KambiWidget-font kw-header l-flexbox l-align-center l-pl-16'>
         <svg xmlns:xlink='http://www.w3.org/1999/xlink' xmlns='http://www.w3.org/2000/svg' class='kw-header-logo'>
            <defs>
               <mask id='svgmask2'>
                  <image className={iconCSSClasses} width='100%' height='100%' xlink:href={iconPath} />
               </mask>
            </defs>
            <rect mask='url(#svgmask2)' id='blendRect' x='0' y='0' width='100%' height='100%'/>
         </svg>
         <div className='kw-header-text-container'>
            <div className='kw-header-title text-truncate'>{title}</div>
            <div className='kw-header-tagline text-truncate'>{subtitle}</div>
         </div>
      </header>);
   }
}

IconHeader.propTypes = {
   iconCSSClasses: React.PropTypes.string,
   iconPath: React.PropTypes.string,
   title: React.PropTypes.string,
   subtitle: React.PropTypes.string,
};

{/*
<IconHeader
   iconCSSClasses={String, optional}
   iconPath={String, optional}
   title={String|ReactComponent}
   subtitle={String|ReactComponent, optional} />
*/}


/**
 * Holds the height of the header in pixels
 * @type {number}
 */
IconHeader.HEIGHT = (coreLibrary.pageInfo.pageType === 'home') ? 37 : 40;

export default Header;
