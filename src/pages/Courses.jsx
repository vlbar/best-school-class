import React, { useState } from 'react'
import { Row, Col, Container, Alert, Button } from 'react-bootstrap'
import { CourseHierarchy } from '../components/courses/CourseHierarchy'
import { SearchCourse } from '../components/courses/SearchCourse'
import usePageTitle from '../components/feedback/usePageTitle'
import { TaskList } from '../components/tasks/TaskList'

function Courses() {
    const [isShowHierarhy, setIsShowHierarhy] = useState(false)
    const [selectedCourse, setSelectedCourse] = useState(undefined)
    usePageTitle({title: 'Курсы'})

    return (
        <Container>
            <Row style={{marginTop: '1Rem', height: '100%'}}>
                <Col md={6}>
                    <h4>База знаний</h4>
                    <SearchCourse onSearching={(flag) => setIsShowHierarhy(!flag)} onCourseSelect={setSelectedCourse}/>
                    {isShowHierarhy && <CourseHierarchy onCourseSelect={setSelectedCourse}/>}
                </Col>

                <Col md={6}>
                    <h4>Задания</h4>
                    <TaskList selectedCourse={selectedCourse}/>
                </Col>
            </Row>
        </Container>
    )
}

export default Courses