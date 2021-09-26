import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

export default function Home() {
	return (
		<div className={styles.container}>
			<Head>
				<title>Admin - Juju 2 Fruits</title>
				<meta
					name='description'
					content='Back Office pour la gestion des commandes Juju 2 Fruits'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
		</div>
	)
}
