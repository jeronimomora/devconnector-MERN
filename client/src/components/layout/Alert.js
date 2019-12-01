import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

const Alert = ({ alerts }) => {
    
    if(alerts && alerts.length > 0){
        return alerts.map(alert => {
            return (
                <div key={ alert.id } className={`alert alert-${alert.alertType}`}>
                    { alert.msg }
                </div>
            )
        })
    }

    return null

}

Alert.propTypes = {
    alerts: PropTypes.array.isRequired,
}

const mapStateToProps= state => ({
    alerts: state.alert
})

export default connect(mapStateToProps)(Alert)
