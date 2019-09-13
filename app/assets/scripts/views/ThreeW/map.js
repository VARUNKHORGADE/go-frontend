'use strict';
import React from 'react';
import { render } from 'react-dom';
import turfBbox from '@turf/bbox';
import mapboxgl from 'mapbox-gl';
import {
  unique,
  _cs,
  addSeparator,
} from '@togglecorp/fujs';

import {
  countries,
  countryIsoMapById,
  countryNameMapById,
} from '../../utils/field-report-constants';

import {
  programmeTypes,
  sectors,
  statuses,
} from '../../utils/constants';

import newMap from '../../utils/get-new-map';

const ProjectDetailElement = ({
  label,
  value,
  className,
}) => (
  <div className={_cs(className, 'popover-project-detail-element')}>
    <div className='popover-project-detail-element-label'>
      {label}
    </div>
    :
    <div className='popover-project-detail-element-value'>
      {value}
    </div>
  </div>
)

const ProjectDetail = ({
  project: {
    name: projectName,
    reporting_ns_detail: {
      society_name: reportingNationalSocietyName,
    },
    start_date: startDate,
    end_date: endDate,
    budget_amount: budget,
    status: statusId,
    programme_type: programmeTypeId,
    primary_sector: sectorId,
    modified_at: modifiedAt = '-',
  },
}) => (
  <div className='popover-project-detail'>
    <ProjectDetailElement
      className='popover-project-detail-last-updated'
      label='Last update'
      value={modifiedAt.substring(0, 10)}
    />
    <div className='popover-project-detail-heading'>
      { reportingNationalSocietyName } : { projectName }
    </div>
    <ProjectDetailElement
      label='Status'
      value={`${statuses[statusId]} (${startDate} to ${endDate})`}
    />
    <ProjectDetailElement
      label='Sector'
      value={sectors[sectorId]}
    />
    <ProjectDetailElement
      label='Programme type'
      value={programmeTypes[programmeTypeId]}
    />
    <ProjectDetailElement
      label='Budget'
      value={addSeparator(budget)}
    />
  </div>
);

export default class ThreeWMap extends React.PureComponent {
  constructor(props) {
    super(props);

    this.mapContainerRef = React.createRef();
  }

  componentDidMount() {
    const { current: mapContainer } = this.mapContainerRef;
    this.map = newMap(
      mapContainer,
      'mapbox://styles/go-ifrc/ck1izjgrs016k1cmxwekow9m0',
    );

    this.map.setMaxZoom(7);

    this.map.on('load', () => {
      const {
        countryId,
        projectList,
      } = this.props;

      const iso2 = countryIsoMapById[countryId].toUpperCase();
      const projectDistrictList = unique(projectList.map(d => d.project_district));

      const currentCountryFeature = this.map.queryRenderedFeatures({
        layers: ['icrc_admin0'],
        filter: [
          '==',
          'ISO2',
          iso2,
        ],
      })[0];

      if (currentCountryFeature) {
        const bbox = turfBbox(currentCountryFeature.geometry);
        this.map.fitBounds(
          bbox,
          {
            padding: {
              top: 10,
              right: 90,
              bottom: 30,
              left: 10,
            }
          });

        this.map.setPaintProperty(
          'adm1',
          'fill-color',
          [
            'match',
            ['get', 'OBJECTID'],
            projectDistrictList,
            '#aaaaaa',
            '#ffffff',
          ],
        );
      }
    });

    this.map.on('click', (e) => {
      const { projectList } = this.props;
      const projectDistrictList = projectList.map(d => d.project_district);

      const features = this.map.queryRenderedFeatures(
        e.point,
        {
          layers: ['adm1'],
          filter: [
            'in',
            'OBJECTID',
            ...projectDistrictList,
          ],
        },
      );

      this.showDistrictDetailPopover(this.map, e.lngLat, features[0]);
    });
  }

  showDistrictDetailPopover = (
    map,
    clickLocation,
    feature,
  ) => {
    if (!feature) {
      return;
    }

    const {
      projectList,
    } = this.props;

    const popoverContent = document.createElement('div');
    const {
      properties,
      geometry,
    } = feature;

    const {
      OBJECTID: districtId,
      Admin01Nam: title,
    } = properties;

    const projectsInCurrentDistrict = projectList.filter(p => p.project_district === districtId);
    const numProjects = projectsInCurrentDistrict.length;

    render((
        <div className='three-w-map-district-detail-popover'>
          <h4 className='detail-popover-title'>
            { title } ({numProjects} { numProjects > 1 ? 'projects' : 'project' })
          </h4>
          <div className='detail-popover-content'>
            { projectsInCurrentDistrict.map(p => (
              <ProjectDetail
                project={p}
                key={p.id}
              />
            ))}
          </div>
        </div>
      ),
      popoverContent,
    );

    if (this.popover) {
      this.popover.remove();
    }

    this.popover = new mapboxgl.Popup({ closeButton: false })
      .setLngLat(clickLocation)
      .setDOMContent(popoverContent.children[0])
      .addTo(map);
  }

  render() {
    return (
      <div
        ref={this.mapContainerRef}
        className='three-w-map'
      />
    );
}
}
