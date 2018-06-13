import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styles from './BlendedBackground.scss'

const userAgent = window.navigator.userAgent
const isIE =
  userAgent.indexOf('MSIE ') !== -1 || userAgent.indexOf('Trident/') !== -1
const isEdge = userAgent.indexOf('Edge/') !== -1

/**
 * Displays a background image which is blended with actual operator's color theme.
 */
class BlendedBackground extends Component {
  cssRender() {
    const style = this.props.blendWithOperatorColor
      ? { backgroundColor: 'currentColor' }
      : {}
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
            backgroundPosition: 'center',
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
              {this.props.blendWithOperatorColor ? (
                <feBlend in2="SourceGraphic" in="slide2" mode="multiply" />
              ) : null}
            </filter>
          </defs>
          <rect
            className={`KambiWidget-primary-color ${styles.blendRect}`}
            x="0"
            y="0"
            filter="url(#filter)"
            width="100%"
            height="100%"
          />
        </svg>
      </div>
    )
  }

  render() {
    /*
      IE and Edge does not support CSS filters, but they support SVG ones
      */

    if (isIE || isEdge) {
      return this.svgRender()
    } else {
      return this.cssRender()
    }
  }
}

/**
 * @property backgroundUrl {String} provides path to backgroundImage
 * @property blendWidthOperatorColor {Boolean} determines if background should be blended with operator color. (Normally not wanted if providing own background image)
 */
BlendedBackground.propTypes = {
  backgroundUrl: PropTypes.string.isRequired,
  blendWithOperatorColor: PropTypes.bool,
}

BlendedBackground.defaultProps = {
  blendWithOperatorColor: true,
}

export default BlendedBackground
