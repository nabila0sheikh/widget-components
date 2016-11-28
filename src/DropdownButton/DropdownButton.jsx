import React, { PropTypes, Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './DropdownButton.scss';

class DropdownButton extends Component {

   constructor(props) {
      super(props);

      this.state = {
         selected: this.props.selected,
         dropDown: false
      };

      this.buttonElement = null;

      this.onBackgroundClick = this.onBackgroundClick.bind(this);
      this.onButtonClick = this.onButtonClick.bind(this);
   }

   // called on background click when drop down window is open
   onBackgroundClick(ev) {
      // setState prevents event from being processed by onOptionClick handler
      // so it is moved to the next cycle
      this.setState({ dropDown: false });
      window.document.documentElement.removeEventListener('click', this.onBackgroundClick, true);
      const btnIndex = ev.target.getAttribute('data-kw-dropdown-button-index');
      if (btnIndex !== null || this.state.selected === btnIndex) {
         this.setState({ selected: btnIndex });
         this.props.onChange(btnIndex);
      }
   }

   /**
    * Shows drop down box with available options.
    * @param {SyntheticEvent} event Click event
    */
   onButtonClick(event) {
      event.stopPropagation();
      this.setState({
         dropDown: true,
      });
      window.document.documentElement.addEventListener('click', this.onBackgroundClick, true); // add event to the capture phase instead of bubble phase
   }

   /**
    * Renders button.
    * @returns {XML}
    */
   render() {
      // calculating position of dropdown while in mobile mode
      let dropdownMobileStyling = {};
      if (this.state.dropDown && this.buttonElement) {
         const { top, bottom } = this.buttonElement.getBoundingClientRect();
         dropdownMobileStyling = {
            top: top,
            bottom: 'auto'
         };
         if (this.props.verticalAlignment === 'bottom') {
            dropdownMobileStyling = {
               top: 'auto',
               bottom: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - bottom
            };
         }
      }

      let cssHAlignClass = styles.leftAlign;
      if (this.props.horizontalAlignment === 'right') {
         cssHAlignClass = styles.rightAlign;
      }

      let cssVAlignClass = styles.topAlign;
      if (this.props.verticalAlignment === 'bottom') {
         cssVAlignClass = styles.bottomAlign;
      }

      return (
         <div className={styles.general}>
            <button
               ref={(node) => { this.buttonElement = node }}
               className={'KambiWidget-card-support-text-color ' + styles.button} onClick={this.onButtonClick}
            >
               {this.props.options[this.state.selected]}
               <i />
            </button>
            {
               this.state.dropDown &&
                  <ul
                     style={dropdownMobileStyling}
                     className={`${styles.dropDown}  ${cssHAlignClass} ${cssVAlignClass}`}
                  >
                     {this.props.options.map((option, i) => {
                        const classNames = [
                           'KambiWidget-card-background-color',
                           'KambiWidget-card-background-color--hoverable',
                           'KambiWidget-card-background-color--clickable'
                        ];

                        if (this.state.selected === i) {
                           classNames.push('KambiWidget-primary-color');
                        }

                        return (
                           <li
                              key={option}
                              data-kw-dropdown-button-index={i}
                              className={classNames.join(' ')}
                           >
                              {option}
                           </li>
                        );
                     })}
                  </ul>
            }
         </div>
      );
   }
}

DropdownButton.propTypes = {
   /**
    * Options array
    */
   options: PropTypes.arrayOf(PropTypes.string).isRequired,

   /**
    * Defines which option should be checked upon component creation
    */
   selected: PropTypes.number,

   /**
    * Option change handler, the function is passed the index that references the position of the element selected in the options array
    */
   onChange: PropTypes.func.isRequired,

   /**
    * Horizontal alignment of the dropdown box. If 'left' will match the left corner of the dropdown with the left corner of the button, if 'right' will match the right corner for the dropdown to the right corner of the button
    * If widget width is smaller than 925 the dropdown will ignore this option and will cover the full width of the widget
    */
   horizontalAlignment: PropTypes.oneOf(['left', 'right']),

   /**
    * Vertical alignment of the dropdown box. If 'top' will match the top corner of the dropdown with the top corner of the button, if 'bottom' will match the bottom corner for the dropdown to the bottom corner of the button
    */
   verticalAlignment: PropTypes.oneOf(['top', 'bottom'])
};

DropdownButton.defaultProps = {
   selected: 0,
   horizontalAlignment: 'right',
   verticalAlignment: 'top'
}

export default DropdownButton;
