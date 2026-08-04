'use client';

import Button from '@/components/button/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function taskPage({ params }) {
    const [task, setTask] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const { id } = await params;
                const response = await fetch(`/api/tasks/${id}`);
                const fetchedTask = await response.json();
                setTask(fetchedTask);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetchTask();
    }, []);

    if (isLoading) return <p>Loading...</p>;

    const onEdit = () => {
        router.push(`/tasks/${task.id}/edit`);
    };

    return (
        <section>
            <ul>
                <li>
                    <h1>{task.title}</h1>
                    <p>{task.status.name}</p>
                </li>
                <li>
                    <p>{task.topic.name}</p>
                    <p>{task.dueDate.slice(0, 10)}</p>
                </li>
                <li>
                    <p>{task.description}</p>
                </li>
                <li>
                    <Button onClick={onEdit}>Edit</Button>
                </li>
            </ul>
        </section>
    );
}
