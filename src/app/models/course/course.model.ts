import { StudentDTO } from "../student/student.dto";
import { StudentM } from "../student/student.model";

export interface JoinCourseM {
    id: number;
    name: string;
    description: string;
    status: boolean;
    limit: number;
    current : number;
    start_date : Date;
    end_date : Date;
    createdAt: Date;
    students: StudentM[];
}