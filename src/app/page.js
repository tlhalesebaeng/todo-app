'use client';

import Button from '@/components/button/Button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './home.module.css';

export default function Home() {
    const [allTasks, setAllTasks] = useState(null);
    const [tasks, setTasks] = useState(null);
    const [tab, setTab] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch('/api/tasks');
                const fetchedTasks = await response.json();
                setTasks(() => {
                    return fetchedTasks.filter((task) => !task.archived);
                });
                setAllTasks(fetchedTasks);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetchTopics();
    }, []);

    useEffect(() => {
        if (tab === 'archived') {
            // Set tasks to be all the archived tasks
            setTasks(() => {
                return allTasks.filter((task) => task.archived);
            });
        }

        if (tab === 'all') {
            setTasks(() => {
                return allTasks.filter((task) => !task.archived);
            });
        }
    }, [tab]);

    const onEdit = (taskId) => {
        router.push(`/tasks/${taskId}/edit`);
    };

    const onChangeArchive = async (taskId) => {
        // If the tab is all then we are archiving otherwise we are unarchiving a task
        const isArchiving = tab === 'all' || tab === null;
        const data = { archived: isArchiving };
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setAllTasks((prevTasks) => {
                    const newTasks = [...prevTasks];
                    for (let i = 0; i < newTasks.length; i++) {
                        if (newTasks[i].id === taskId) newTasks[i].archived = isArchiving;
                    }
                    return newTasks;
                });

                // Remove the task from the current list of tasks. This state will receive the latest state of allTasks
                setTasks(() => {
                    if (isArchiving) {
                        return allTasks.filter((task) => !task.archived);
                    }

                    return allTasks.filter((task) => task.archived);
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onView = (taskId) => {
        router.push(`/tasks/${taskId}`);
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <section>
            <h1>Your favourite TODO Tasks app!!!</h1>
            <ul className={styles.tabContainer}>
                <li onClick={() => setTab('all')}>All</li>
                <li onClick={() => setTab('archived')}>Archived</li>
            </ul>
            <p>Some filter shit next to the tabs</p>
            <section>
                <Button onClick={() => router.push('/tasks')}>Create New Task</Button>
                <Button onClick={() => router.push('/topics')}>View All Topics</Button>
            </section>
            <ul>
                {tasks.map(({ id, title, dueDate, status, topic }) => {
                    const btnName = tab === 'all' || tab === null ? 'Archive' : 'Unarchive';
                    return (
                        <li key={id}>
                            <section>
                                <h3>{title}</h3>
                                <h4>{topic.name}</h4>
                                <p>Due Date: {dueDate.slice(0, 10)}</p>
                            </section>
                            <section>
                                <p>{status.name}</p>
                                <section>
                                    <Button onClick={() => onView(id)}>View</Button>
                                    <Button onClick={() => onEdit(id)}>Edit</Button>
                                    <Button onClick={() => onChangeArchive(id)}>{btnName}</Button>
                                </section>
                            </section>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
