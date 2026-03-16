<?php

namespace App\DataFixtures;

use App\Entity\Session;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

class SessionFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        /** @var User $admin */
        $admin = $this->getReference('user_admin', User::class);

        $session1 = new Session();
        $session1->setTitreSession('Mots Croisés Cosmétiques');
        $session1->setCodeSession('SESS01'); // Code fixe pour faciliter les tests
        $session1->setDuree(900); // 15 minutes
        $session1->setCreateur($admin);
        $manager->persist($session1);
        $this->addReference('session_1', $session1);

        $session2 = new Session();
        $session2->setTitreSession('Association Termes & Définitions');
        $session2->setCodeSession('SESS02'); // Code fixe pour faciliter les tests
        $session2->setDuree(600); // 10 minutes
        $session2->setCreateur($admin);
        $manager->persist($session2);
        $this->addReference('session_2', $session2);

        $session3 = new Session();
        $session3->setTitreSession('Formulation de Produits');
        $session3->setCodeSession('SESS03'); // Code fixe
        $session3->setDuree(1200); // 20 minutes
        $session3->setCreateur($admin);
        $manager->persist($session3);
        $this->addReference('session_3', $session3);


        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class,
        ];
    }
}
