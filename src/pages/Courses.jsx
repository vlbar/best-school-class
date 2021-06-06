import React from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import { CourseHierarchy } from '../components/courses/CourseHierarchy'
import { FindCourse } from '../components/courses/FindCourse'

function Courses() {
    return (
        <Container>
            <Row style={{marginTop: "1Rem", height: "100%"}}>
                <Col md={6}>
                    <h4>База знаний</h4>
                    <FindCourse/>
                    <CourseHierarchy/>
                </Col>

                <Col md={6}>
                    <h4>Задания</h4>
                </Col>
            </Row>
        </Container>
    )
}

export default Courses