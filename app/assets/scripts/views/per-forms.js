'use strict';

import React from 'react';
import A1PolicyStrategyForm from './per-forms/a1-policy-strategy-form';
import A2AnalysisAndPlanningForm from './per-forms/a2-analysis-and-planning-form';
import A3OperationalCapacity from './per-forms/a3-operational-capacity';
import A4Coordination from './per-forms/a4-coordination';
import A5OperationsSupport from './per-forms/a5-operations-support';
import A6Performance from './per-forms/a6-performance';
import { Helmet } from 'react-helmet';
import { environment } from './../config';
import { PropTypes as T } from 'prop-types';
import App from './app';

class PerForms extends React.Component {
  render () {
    console.log(this.props.location.pathname);
    let form = null;
    if (this.props.location.pathname === '/per-forms/policy-strategy') {
      form = (<A1PolicyStrategyForm />);
    } else if (this.props.location.pathname === '/per-forms/analysis-and-planning') {
      form = (<A2AnalysisAndPlanningForm />);
    } else if (this.props.location.pathname === '/per-forms/operational-capacity') {
      form = (<A3OperationalCapacity />);
    } else if (this.props.location.pathname === '/per-forms/coordination') {
      form = (<A4Coordination />);
    } else if (this.props.location.pathname === '/per-forms/operations-support') {
      form = (<A5OperationsSupport />);
    } else if (this.props.location.pathname === '/per-forms/performance') {
      // Misnamed - A3 - Operational Capacity
      form = (<A6Performance />);
    }

    return (
      <App className='page--emergencies'>
        <Helmet>
          <title>IFRC Go - Emergencies</title>
        </Helmet>
        <section className='inpage'>
          <div className='inpage__body'>
            <div className='inner'>
              {form}
            </div>
          </div>
        </section>
      </App>
    );
  }
}

if (environment !== 'production') {
  PerForms.propTypes = {
    user: T.object,
    profile: T.object,
    fieldReport: T.object,
    _getProfile: T.func,
    _updateSubscriptions: T.func,
    _getFieldReportsByUser: T.func,
    _updateProfile: T.func
  };
}

export default PerForms;
