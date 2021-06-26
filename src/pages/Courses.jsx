import React, { useState } from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import { CourseHierarchy } from '../components/courses/CourseHierarchy'
import { SearchCourse } from '../components/courses/SearchCourse'

function Courses() {
    const [isShowHierarhy, setIsShowHierarhy] = useState(false)

    return (
        <Container>
            <Row style={{marginTop: "1Rem", height: "100%"}}>
                <Col md={6}>
                    <h4>База знаний</h4>
                    <SearchCourse onSearching={(flag) => setIsShowHierarhy(!flag)}/>
                    {isShowHierarhy && <CourseHierarchy isShow={true}/>}
                </Col>

                <Col md={6}>
                    <h4>Задания</h4>
                </Col>
            </Row>
        </Container>
    )
}

export default Courses