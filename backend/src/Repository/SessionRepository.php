<?php

// Namespace du repository dans le projet Symfony.
namespace App\Repository;

// Entité gérée par ce repository.
use App\Entity\Session;

// Classe de base Doctrine pour créer un repository Symfony.
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

// ManagerRegistry permet à Doctrine d'accéder à la configuration de la base de données.
use Doctrine\Persistence\ManagerRegistry;

/**
 * Repository lié à l'entité Session.
 * Il permet de faire des requêtes en base sur la table des sessions.
 *
 * @extends ServiceEntityRepository<Session>
 */
class SessionRepository extends ServiceEntityRepository
{
    // Constructeur appelé automatiquement par Symfony.
    public function __construct(ManagerRegistry $registry)
    {
        // Associe ce repository à l'entité Session.
        parent::__construct($registry, Session::class);
    }

    // Les méthodes ci-dessous sont des exemples générés par Symfony.
    // Elles sont commentées car elles ne sont pas utilisées dans le projet actuel.

    //    /**
    //     * Exemple de méthode personnalisée qui retournerait plusieurs sessions.
    //     *
    //     * @return Session[] Returns an array of Session objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('s.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    /**
    //     * Exemple de méthode personnalisée qui retournerait une seule session ou null.
    //     */
    //    public function findOneBySomeField($value): ?Session
    //    {
    //        return $this->createQueryBuilder('s')
    //            ->andWhere('s.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}