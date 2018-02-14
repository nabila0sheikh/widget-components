import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './BlendedBackground.scss'
import { coreLibrary } from 'kambi-widget-core-library'


/**
 * Displays a background image which is blended with actual operator's color theme.
 */
class BlendedBackground extends Component {
 
  cssRender() {
    const style = this.props.blendWithOperatorColor ? { backgroundColor: 'currentColor'} : {}
    return (
      <div
        className={`${styles.backgroundContainer} KambiWidget-primary-color`}
        style={style}
      >
        <div
          className={styles.background}
          style={{
            backgroundImage: `url(${this.props.backgroundUrl})`,
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'multiply',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
    )
  }

  svgRender() {
    return (
      <div className={styles.backgroundContainer}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          className={styles.background}
        >
          <defs>
            <filter id="filter">
              <feImage
                result="slide2"
                x="0"
                y="0"
                width="100%"
                preserveAspectRatio="xMidYMid slice"
                xlinkHref={this.props.backgroundUrl}
              />
              {
                this.props.blendWithOperatorColor ? (
                  <feBlend in2="SourceGraphic" in="slide2" mode="multiply" />
                ) : null
              }
            </filter>
          </defs>
          <rect
            className={`KambiWidget-primary-color ${styles.blendRect}`}
            x="0"
            y="0"
            filter='url(#filter)'
            width="100%"
            height="100%"
          />
        </svg>
      </div>
    )
  }

  render() {
    /*
      as of firefox 55.0, firefox has a bug with the way we render the svg
      as a workaround we render the same thing using the new CSS mixBlendMode
      property. This property is not supported in IE so the main way to render
      this should still be using the SVG render
      */
    if (coreLibrary.browser === 'firefox') {
      return this.cssRender()
    } else {
      return this.svgRender()
    }
  }
}

/**
 * @property backgroundUrl {String} provides path to backgroundImage
 * @property blendWidthOperatorColor {Boolean} determines if background should be blended with operator color. (Normally not wanted if providing own background image)
 */
BlendedBackground.propTypes = {
  backgroundUrl: PropTypes.string.isRequired,
  blendWithOperatorColor: PropTypes.bool
}

BlendedBackground.defaultProps = {
  blendWithOperatorColor: true,
}

export default BlendedBackground
