import React, { useState } from 'react'
import slugify from 'slugify'
import { Table, Th, Td } from '~components/common/table'
import { Form, Input } from '~components/common/form'
import Modal from '~components/common/modal'
import facilitiesStyles from './facilities.module.scss'

const getNumber = number => {
  if (!number) {
    return 0
  }
  if (number.search('<') > -1) {
    return 0
  }
  return parseInt(number, 10)
}

const FacilityDetails = ({ facility }) => (
  <div className={facilitiesStyles.details}>
    <h3>{facility.facility_name}</h3>
    <Table>
      <thead>
        <tr>
          <Th header>Field</Th>
          <Th header>Value</Th>
        </tr>
      </thead>
      <tbody>
        {Object.keys(facility).map(field => (
          <tr>
            <Td>{field}</Td>
            <Td>{facility[field]}</Td>
          </tr>
        ))}
      </tbody>
    </Table>
  </div>
)

const SearchForm = ({ setSearchQuery }) => {
  const [search, setSearch] = useState(false)
  return (
    <Form>
      <Input
        type="text"
        label="Search facilities"
        placeholder="Search by city, county, or facility name"
        hideLabel
        onChange={event => {
          setSearch(event.target.value)
        }}
      />
      <button
        type="submit"
        onClick={event => {
          const query = search.trim().toLowerCase()
          event.preventDefault()
          setSearchQuery(query.length ? query : false)
        }}
      >
        Search
      </button>
    </Form>
  )
}

const LongTermCareFacilities = ({ facilities }) => {
  const [sort, setSort] = useState({ field: 'name', desc: true })
  const [searchQuery, setSearchQuery] = useState(false)
  const [openedFacility, setOpenedFacility] = useState(false)

  const hasCity =
    facilities.map(group => group.nodes[0]).filter(({ city }) => city).length >
    0
  const hasCounty =
    facilities.map(group => group.nodes[0]).filter(({ county }) => county)
      .length > 0
  const facilityList = facilities
    .map(group => group.nodes[0])
    .sort((a, b) => {
      if (['resident_positives', 'resident_deaths'].indexOf(sort.field) > -1) {
        if (getNumber(a[sort.field]) === getNumber(b[sort.field])) {
          return 0
        }
        if (getNumber(a[sort.field]) < getNumber(b[sort.field])) {
          return sort.desc ? 1 : -1
        }
        return sort.desc ? -1 : 1
      }
      if (a[sort.field] === b[sort.field]) {
        return 0
      }
      if (a[sort.field] < b[sort.field]) {
        return sort.desc ? 1 : -1
      }
      return sort.desc ? -1 : 1
    })
    .filter(facility => {
      if (!searchQuery) {
        return true
      }
      return (
        facility.facility_name.toLowerCase().search(searchQuery) > -1 ||
        (facility.county &&
          facility.county.toLowerCase().search(searchQuery) > -1) ||
        (facility.city && facility.city.toLowerCase().search(searchQuery)) > -1
      )
    })

  const handleSortClick = field => {
    const desc = sort.field === field ? !sort.desc : true
    setSort({
      field,
      desc,
    })
  }

  const sortDirection = field => {
    if (sort.field === field) {
      return sort.desc ? 'up' : 'down'
    }
    return null
  }
  return (
    <>
      <SearchForm setSearchQuery={query => setSearchQuery(query)} />
      <Modal
        isOpen={openedFacility}
        onClose={() => {
          setOpenedFacility(false)
        }}
      >
        <FacilityDetails facility={openedFacility} />
      </Modal>
      <Table>
        <thead>
          <tr>
            {hasCounty && (
              <Th
                header
                alignLeft
                sortable
                onClick={() => handleSortClick('county')}
                sortDirection={sortDirection('county')}
              >
                County
              </Th>
            )}
            {hasCity && (
              <Th
                header
                alignLeft
                sortable
                onClick={() => handleSortClick('city')}
                sortDirection={sortDirection('city')}
              >
                City
              </Th>
            )}
            <Th
              header
              alignLeft
              sortable
              onClick={() => handleSortClick('facility_name')}
              sortDirection={sortDirection('facility_name')}
            >
              Name
            </Th>
            <Th header alignLeft>
              Category
            </Th>
            <Th
              header
              isFirst
              sortable
              onClick={() => handleSortClick('resident_positives')}
              sortDirection={sortDirection('resident_positives')}
            >
              Resident positives
            </Th>
            <Th
              header
              sortable
              onClick={() => handleSortClick('resident_deaths')}
              sortDirection={sortDirection('resident_deaths')}
            >
              Resident deaths
            </Th>
          </tr>
        </thead>
        <tbody>
          {facilityList.map(facility => {
            const facilityId = slugify(
              [facility.county, facility.city, facility.facility_name].join(
                '-',
              ),
              { lower: true },
            )
            return (
              <tr key={facilityId} id={facilityId}>
                {hasCounty && <Td alignLeft>{facility.county}</Td>}
                {hasCity && <Td alignLeft>{facility.city}</Td>}
                <Td alignLeft>
                  <button
                    className={facilitiesStyles.linkButton}
                    type="button"
                    onClick={event => {
                      event.preventDefault()
                      setOpenedFacility(facility)
                      window.location.hash = facilityId
                    }}
                  >
                    {facility.facility_name}
                  </button>
                </Td>
                <Td alignLeft>{facility.ctp_facility_category}</Td>
                <Td isFirst>{facility.resident_positives}</Td>
                <Td>{facility.resident_deaths}</Td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </>
  )
}

export default LongTermCareFacilities